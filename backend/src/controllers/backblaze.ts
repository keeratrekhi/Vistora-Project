import B2 from "backblaze-b2";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";
import { Request, RequestHandler, Response } from "express";
import formidable, { File as FormidableFile } from "formidable";
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2CommandOutput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PrismaClient } from "@prisma/client";
import * as crypto from 'crypto';
import { promisify } from 'util';
import JSZip from "jszip";
import { Readable } from "stream";
import archiver from "archiver";
import axios from "axios";


dotenv.config();


// Promisify stream pipeline and other functions
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);


// File size limits
const MAX_FILE_SIZE = 200 * 1024 * 1024 * 1024; // 200GB
const CHUNK_SIZE = 100 * 1024 * 1024;


const prisma= new PrismaClient();

const formatBytes = (bytes: bigint): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = Number(bytes);
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
};



const b2 = new B2({
  applicationKeyId: process.env.B2_KEY_ID!,
  applicationKey: process.env.B2_SECRET_KEY!,
});



export async function uploadToB2(
  filePath: string,
  eventId: string,
  originalFilename: string | null,
): Promise<void> {
  const allowedExt = [
  ".jpg", ".jpeg", ".png", 
  ".mp4", ".mov", ".mkv", ".avi", ".flv", ".webm",".is",
  ".txt",
  ".mp3", ".wav", ".ogg"
];

try{

  const ext = originalFilename ? path.extname(originalFilename).toLowerCase() : path.extname(filePath).toLowerCase();
  if (!allowedExt.includes(ext)) throw new Error(`Invalid file type: ${ext}`);

  const stats = await stat(filePath);
  if (stats.size > MAX_FILE_SIZE) {
    throw new Error(`File exceeds ${MAX_FILE_SIZE / 1024 / 1024 / 1024}GB limit`);
  }

  const fileName =originalFilename|| path.basename(filePath);
  const remoteFileName = `events/${eventId}/${fileName}`;

  await b2.authorize();

  // For files larger than 1GB, use chunked upload
  if (stats.size > 1000 * 1024 * 1024) {
    await uploadLargeFile(filePath, remoteFileName);
  } else {
    await uploadSingleFile(filePath, remoteFileName);
  }

  console.log(`Uploaded file as ${remoteFileName}`);

   } catch (error:any) {
    console.error("Backblaze B2 Upload Error:", {
      message: error.response?.data?.message || error.message,
      code: error.response?.data?.code,
      status: error.response?.status
    });
    throw error;
  }
}



export async function uploadcoverToB2(
  filePath: string,
  eventId: string,
  originalFilename: string | null,
): Promise<void> {
  const allowedExt = [
  ".jpg", ".jpeg", ".png", 
  ".mp4", ".mov", ".mkv", ".avi", ".flv", ".webm",".is",
  ".txt",
  ".mp3", ".wav", ".ogg"
];

try{

  const ext = path.extname(filePath).toLowerCase();
  if (!allowedExt.includes(ext)) throw new Error(`Invalid file type: ${ext}`);

  const stats = await stat(filePath);
  if (stats.size > MAX_FILE_SIZE) {
    throw new Error(`File exceeds ${MAX_FILE_SIZE / 1024 / 1024 / 1024}GB limit`);
  }

  const fileName = path.basename(filePath);
  const remoteFileName = `events/${eventId}/cover/${fileName}`;

  await b2.authorize();

  // For files larger than 1GB, use chunked upload
  if (stats.size > 1000 * 1024 * 1024) {
    await uploadLargeFile(filePath, remoteFileName);
  } else {
    await uploadSingleFile(filePath, remoteFileName);
  }

  console.log(`✅ Uploaded file as ${remoteFileName}`);

   } catch (error:any) {
    console.error("Backblaze B2 Upload Error:", {
      message: error.response?.data?.message || error.message,
      code: error.response?.data?.code,
      status: error.response?.status
    });
    throw error;
  }
}





async function uploadSingleFile(filePath: string, remoteFileName: string) {
  const uploadUrlResponse = await b2.getUploadUrl({
    bucketId: process.env.B2_BUCKET_ID!,
  });

  const uploadUrl = uploadUrlResponse.data.uploadUrl;
  const uploadAuthToken = uploadUrlResponse.data.authorizationToken;

  const fileBuffer = await readFile(filePath);
  await b2.uploadFile({
    uploadUrl,
    uploadAuthToken,
    fileName: remoteFileName,
    data: fileBuffer,
  });
}

async function uploadLargeFile(filePath: string, remoteFileName: string) {
  // Start large file upload session
  const largeFileResponse = await b2.startLargeFile({
    bucketId: process.env.B2_BUCKET_ID!,
    fileName: remoteFileName,
    // @ts-ignore - Work around type definition limitation
    contentType: 'b2/x-auto'
  });
  
  const fileId = largeFileResponse.data.fileId;

  try {
    // Get upload part URL
    const uploadPartUrlResponse = await b2.getUploadPartUrl({ fileId });
    const uploadUrl = uploadPartUrlResponse.data.uploadUrl;
    const authToken = uploadPartUrlResponse.data.authorizationToken;

    const fileStats = await stat(filePath);
    const fileSize = fileStats.size;
    const totalParts = Math.ceil(fileSize / CHUNK_SIZE);
    const partShas: string[] = [];

    console.log(`Starting large file upload (${fileSize} bytes) with ${totalParts} parts`);

    // Process each chunk
 
    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
      const start = (partNumber - 1) * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, fileSize);
      const chunkSize = end - start;
      
      const fd = await fs.promises.open(filePath, 'r');
      try {
        // Use stream instead of full buffer
        const readStream = fd.createReadStream({
          start,
          end: end - 1,
          highWaterMark: 5 * 1024 * 1024 // 5MB chunks
        });

        const hash = crypto.createHash('sha1');
        const chunks: Buffer[] = [];
        
        for await (const chunk of readStream) {
          chunks.push(chunk);
          hash.update(chunk);
        }
        
        const chunkBuffer = Buffer.concat(chunks);
        const sha1 = hash.digest('hex');

        // Upload the part
        const response = await b2.uploadPart({
          partNumber,
          uploadUrl,
          uploadAuthToken: authToken,
          data: chunkBuffer,
          contentLength: chunkSize,
          hash: sha1,
        });

        partShas.push(response.data.contentSha1);
        console.log(`Uploaded part ${partNumber}/${totalParts} (${chunkSize} bytes)`);
      } finally {
        await fd.close();
      }
    }

    // Finish large file upload
         await b2.finishLargeFile({
      fileId,
      partSha1Array: partShas,
    });

    console.log(`Completed large file upload with ${totalParts} parts`);
  } catch (error) {
    console.error('Error during chunked upload:', error);
    // Cancel the upload session on error
    await b2.cancelLargeFile({ fileId });
    throw error;
  }
}



export default async function UploadHandler(req: Request, res: Response) : Promise<void> {
  if (req.method !== "POST") {
     res.status(405).json({ message: "Method not allowed" });
     return ;
  }

  try {
    const form = formidable({
      multiples: true,
      keepExtensions: true,
      maxFileSize: MAX_FILE_SIZE,
      filter: (part) => {
        return (
          part.mimetype?.startsWith("image/") ||
          part.mimetype?.startsWith("video/") ||
          part.mimetype?.startsWith("audio/") ||
          part.mimetype === "text/plain"
        );
      },
    });

    const { fields, files } = await new Promise<{ 
      fields: formidable.Fields; 
      files: formidable.Files 
    }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    console.log("Fields received:", fields);
    console.log("Files received:", files);

    // Convert files to an array
    const fileArray = Array.isArray(files.file) 
      ? files.file 
      : files.file 
        ? [files.file] 
        : [];

    if (!fileArray.length) {
       res.status(400).json({ message: "No files uploaded" });
       return ;
    }

    const eventId = Array.isArray(fields.eventId) 
      ? fields.eventId[0] 
      : fields.eventId;

    if (!eventId || typeof eventId !== "string") {
      res.status(400).json({ message: "Invalid or missing Event ID" });
       return ;
    }

    // Validate event and user
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { userId: true }
    });
    if (!event) {
      res.status(404).json({ message: "Event not found" });
       return ;
    }

    const user = await prisma.user.findUnique({
      where: { id: event.userId },
      select: { storageUsed: true, totalStorageAllowed: true }
    });
    if (!user) {
      res.status(404).json({ message: "User not found" });
       return ;
    }

    // Calculate total size of all files
    let totalSize = 0n;
    const tempFiles: string[] = [];
    
    try {
      for (const file of fileArray) {
        if (file.filepath) {
          const stats = fs.statSync(file.filepath, { bigint: true });
          totalSize += stats.size;
          tempFiles.push(file.filepath); // Track temp files for cleanup
        }
      }

      const storageUsed = BigInt(user.storageUsed);
      const totalStorageAllowed = BigInt(user.totalStorageAllowed);
      const remainingSpace = totalStorageAllowed - storageUsed;

      if (totalSize > remainingSpace) {
        res.status(400).json({
          message: `Storage limit exceeded. Remaining space: ${formatBytes(remainingSpace)}`
        });
         return ;
      }

      // Upload each file to Backblaze B2
      const uploadResults: string[] = [];
      for (const file of fileArray) {
        if (file.filepath) {
          try {
          await uploadToB2(file.filepath, eventId, file.originalFilename);
            uploadResults.push(file.originalFilename || path.basename(file.filepath));
          } catch (uploadError : any) {
            console.error("❌ File upload failed:", {
              file: file.originalFilename,
              error: uploadError.message
            });
            throw new Error(`Failed to upload ${file.originalFilename}: ${uploadError.message}`);
          }
        }
      }

      // Update user storage
      await prisma.user.update({
        where: { id: event.userId },
        data: { storageUsed: { increment: totalSize } },
      });

      res.status(200).json({
        message: "Files uploaded successfully",
        files: uploadResults,
        storageUsed: (storageUsed + totalSize).toString(),
        totalStorage: totalStorageAllowed.toString(),
      });
       return ;

    } catch (error : any) {
      console.error("❌ Upload Processing Error:", {
        message: error.message,
        stack: error.stack,
        eventId,
        userId: event.userId
      });
      
      res.status(500).json({
        message: "Upload processing failed",
        error: process.env.NODE_ENV === "development" 
          ? error.message 
          : "Internal server error",
      });
       return ;
    } finally {
      // Clean up temp files whether upload succeeded or failed
      for (const filePath of tempFiles) {
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`🧹 Deleted temp file: ${filePath}`);
          }
        } catch (cleanupError : any) {
          console.error("❌ Temp file cleanup failed:", cleanupError.message);
        }
      }
    }

  } catch (error : any) {
    console.error("❌ Form Parsing Error:", {
      message: error.message,
      stack: error.stack
    });

    res.status(500).json({
      message: "Form parsing failed",
      error: process.env.NODE_ENV === "development" 
        ? error.message 
        : "Internal server error",
    });
     return ;
  }
}






const s3client = new S3Client({
  region: "us-east-005",
  endpoint: "https://s3.us-east-005.backblazeb2.com",
  credentials: {
    accessKeyId: process.env.B2_KEY_ID!,
    secretAccessKey: process.env.B2_SECRET_KEY!,
  },
  forcePathStyle: true,
});

// Endpoint to get media URLs for a directory
export const GetMedia = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const directory = `events/${eventId}/`;

    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.BUCKET_NAME!,
      Prefix: directory,
    });

    const listResult = await s3client.send(listCommand);

    if (!listResult.Contents || listResult.Contents.length === 0) {
      return res.status(404).json({ error: "Directory not found" });
    }

    // Filter out subdirectories and directory markers
    const rootFiles = listResult.Contents.filter(file => {
      if (!file.Key) return false;
      
      // Skip directory markers (end with '/')
      if (file.Key.endsWith('/')) return false;
      
      // Remove directory prefix
      const relativePath = file.Key.substring(directory.length);
      
      // Exclude files in subfolders (like 'cover/')
      return !relativePath.includes('/');
    });

    const mediaUrls = await Promise.all(
      rootFiles.map(async (file) => {
        const url = await getSignedUrl(
          s3client,
          new GetObjectCommand({
            Bucket: process.env.BUCKET_NAME!,
            Key: file.Key!,
          }),
          { expiresIn: 3600 }
        );

        return {
          url,
          name: file.Key!.split("/").pop(),          // Filename only
          type: getFileType(file.Key!),               // File type detection
          size: file.Size
        };
      })
    );

    res.json(mediaUrls);
  } catch (error) {
    console.error("Backend error:", error);
    res.status(500).json({ error: "Failed to load media" });
  }
};


function getFileType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (!ext) return "other"; // Handle files without extensions
  
  // Supported image types
  const imageTypes = ["jpg", "jpeg", "png", "gif", "webp", "bmp"];
  // Supported video types
  const videoTypes = ["mp4", "mov", "webm", "mkv", "avi", "flv", "wmv", "m4v","is"];
  
  if (imageTypes.includes(ext)) return "image";
  if (videoTypes.includes(ext)) return "video";
  return "other";
}



//helper function to validate BigInt values
function validateBigInt(value: any, defaultValue: bigint = 0n): bigint {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'string') {
    try {
      return BigInt(value);
    } catch (e) {
      console.error(`Invalid BigInt string: ${value}`);
    }
  }
  if (typeof value === 'number') return BigInt(Math.floor(value));
  console.error(`Invalid value for BigInt conversion:`, value);
  return defaultValue;
}




// Helper function to get file info by fileName
async function getFileInfoByFileName(fileName: string): Promise<any> {
  await b2.authorize();
  
  try {
    // First get the file ID using listFileNames
    const listResponse = await b2.listFileNames({
      bucketId: process.env.B2_BUCKET_ID!,
      prefix: fileName,
      delimiter: '/',
      maxFileCount: 1,
      startFileName: '' // Use empty string instead of undefined
    });

    const fileInfo = listResponse.data.files.find(
      (file: any) => file.fileName === fileName
    );
    if (!fileInfo) {
      return null;
    }

    // Now get the full file info with version details
    const fileDetails = await b2.getFileInfo({
      fileId: fileInfo.fileId
    });

    return fileDetails.data;
  } catch (error) {
    console.error("Error in getFileInfoByFileName:", error);
    throw error;
  }
}




async function getcoverFileInfoByFileName(fileName: string): Promise<any> {
  await b2.authorize();
  
  try {

    const fullFileName = fileName.includes('cover/') 
      ? fileName 
      : `events/${fileName}`;

    console.log(`[getFileInfoByFileName] Searching for: ${fullFileName}`);

    const listResponse = await b2.listFileNames({
      bucketId: process.env.B2_BUCKET_ID!,
      prefix: fullFileName,
      delimiter: '/',
      maxFileCount: 1,
      startFileName: fullFileName // Use the full file name as start point
    });

    console.log(`[getFileInfoByFileName] Found ${listResponse.data.files.length} files`);

    // Find exact match (case-sensitive)
    const fileInfo = listResponse.data.files.find(
      (file: any) => file.fileName === fullFileName
    );

    if (!fileInfo) {
      console.warn(`[getFileInfoByFileName] File not found: ${fullFileName}`);
      return null;
    }

    console.log(`[getFileInfoByFileName] Found file ID: ${fileInfo.fileId}`);

    const fileDetails = await b2.getFileInfo({
      fileId: fileInfo.fileId
    });

    return fileDetails.data;
  } catch (error) {
    console.error("Error in getFileInfoByFileName:", error);
    throw error;
  }
}

// Delete entire event folder
export async function deleteEventFolder(eventId: string): Promise<bigint> {
  await b2.authorize();
  const prefix = `events/${eventId}/`;
  let nextFileName: string | null = null; // Use null instead of empty string
  const files: any[] = [];
  let totalSize = 0n;

  try {
    do {
      const listOpts: any = {
        bucketId: process.env.B2_BUCKET_ID!,
        prefix,
        startFileName: nextFileName || undefined, // Handle null correctly
        maxFileCount: 1000
      };

      const response = await b2.listFileNames(listOpts);
      files.push(...response.data.files);
      nextFileName = response.data.nextFileName || null; // Proper null handling
    } while (nextFileName);

    // Delete files in parallel
    await Promise.all(files.map(async (file) => {
      try {
        // Get file info for size
        const fileDetails = await b2.getFileInfo({ fileId: file.fileId });
        const size = BigInt(fileDetails.data.contentLength);
        totalSize += size;
        
        await b2.deleteFileVersion({
          fileId: file.fileId,
          fileName: file.fileName,
        });
        
        console.log(`✅ Deleted ${file.fileName}, Size: ${size}`);
      } catch (fileError) {
        console.error(`❌ Failed to delete ${file.fileName}:`, fileError);
      }
    }));

    return totalSize;
  } catch (error:any) {
    console.error(` Error deleting event folder ${eventId}:`, error);
    throw new Error(`Failed to delete event folder: ${error.message}`);
  }
}

export async function deleteSingleFile(
  eventId: string,
  fileName: string
): Promise<bigint> {
  const fullFileName = `events/${eventId}/${fileName}`;
  console.log(`Deleting single file: ${fullFileName}`);

  try {
    const fileInfo = await getFileInfoByFileName(fullFileName);
    if (!fileInfo) {
      throw new Error("File not found");
    }

    const size = BigInt(fileInfo.contentLength);
    console.log(`File size: ${size}`);

    await b2.deleteFileVersion({
      fileId: fileInfo.fileId,
      fileName: fullFileName,
    });

    console.log(`Successfully deleted file: ${fullFileName}`);
    return size;
  } catch (error) {
    console.error(`Error deleting file ${fullFileName}:`, error);
    throw error;
  }
}


export async function deleteSinglecoverFile(
  eventId: string,
  fileName: string
): Promise<bigint> {
  const fullFileName = `events/${eventId}/cover/${fileName}`;
  console.log(`Deleting single file: ${fullFileName}`);

  try {
    const fileInfo = await getcoverFileInfoByFileName(fullFileName);
    if (!fileInfo) {
      throw new Error("File not found");
    }

    const size = BigInt(fileInfo.contentLength);
    console.log(`File size: ${size}`);

    await b2.deleteFileVersion({
      fileId: fileInfo.fileId,
      fileName: fullFileName,
    });

    console.log(`Successfully deleted file: ${fullFileName}`);
    return size;
  } catch (error) {
    console.error(`Error deleting file ${fullFileName}:`, error);
    throw error;
  }
}

// Updated route handlers with comprehensive checks:

export const deleteEvent = async (req: Request, res: Response) => {
  const { eventId } = req.params;
  console.log(`DELETE EVENT REQUEST: ${eventId}`);

  try {
    //  Fetch event and verify ownership
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { userId: true },
    });

    if (!event) {
      console.log(`Event not found: ${eventId}`);
      return res.status(404).json({ error: "Event not found" });
    }

    //Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: event.userId },
    });

    if (!user) {
      console.log(`User not found for event: ${event.userId}`);
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`Current storage for user ${user.id}: ${user.storageUsed}`);

    //  Delete media files from storage
    const sizeFreed = await deleteEventFolder(eventId);
    console.log(`Size freed: ${sizeFreed}`);

    //Update user's storage using atomic decrement
    const updatedUser = await prisma.user.update({
      where: { id: event.userId },
      data: { 
        storageUsed: { 
          decrement: sizeFreed 
        } 
      },
    });

    console.log(`Updated storage: ${updatedUser.storageUsed}`);

    // Verify storage was actually updated
    if (BigInt(updatedUser.storageUsed) !== BigInt(user.storageUsed) - sizeFreed) {
      console.error("Storage update mismatch!");
      console.error(`Expected: ${BigInt(user.storageUsed) - sizeFreed}`);
      console.error(`Actual: ${updatedUser.storageUsed}`);
    }

    //  Delete the event record from database
    await prisma.event.delete({
      where: { id: eventId },
    });

    console.log(`Event ${eventId} deleted successfully`);
    
    res.status(200).json({
      message: "Event and all associated media deleted successfully",
      sizeFreed: sizeFreed.toString(),
      newStorageUsed: updatedUser.storageUsed.toString(),
    });
  } catch (error: any) {
    console.error("FULL DELETE EVENT ERROR:", error);
    
    let errorMessage = "Deletion failed";
    if (error.code === 'P2025') {
      errorMessage = "Event not found in database";
    } else if (error.message.includes("not found")) {
      errorMessage = "Event folder not found in storage";
    }
    
    res.status(500).json({ error: errorMessage, details: error.message });
  }
};

export const deleteFile = async (req: Request, res: Response) => {
  const { eventId, fileName } = req.params;
  console.log(`DELETE FILE REQUEST: ${eventId}/${fileName}`);

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { userId: true },
    });

    if (!event) {
      console.log(`Event not found: ${eventId}`);
      return res.status(404).json({ error: "Event not found" });
    }

    const user = await prisma.user.findUnique({
      where: { id: event.userId },
    });

    if (!user) {
      console.log(`User not found: ${event.userId}`);
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`Current storage: ${user.storageUsed}`);
    
    const sizeFreed = await deleteSingleFile(eventId, fileName);
    console.log(`Size freed: ${sizeFreed}`);

    const updatedUser = await prisma.user.update({
      where: { id: event.userId },
      data: { 
        storageUsed: { 
          decrement: sizeFreed 
        } 
      },
    });

    console.log(`Updated storage: ${updatedUser.storageUsed}`);

    // Verify storage was actually updated
    if (BigInt(updatedUser.storageUsed) !== BigInt(user.storageUsed) - sizeFreed) {
      console.error("Storage update mismatch!");
      console.error(`Expected: ${BigInt(user.storageUsed) - sizeFreed}`);
      console.error(`Actual: ${updatedUser.storageUsed}`);
    }

    res.status(200).json({
      message: "File deleted",
      fileName,
      sizeFreed: sizeFreed.toString(),
      newStorageUsed: updatedUser.storageUsed.toString(),
    });
  } catch (error: any) {
    console.error("FULL DELETE FILE ERROR:", error);
    if (error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
    } else {
      res.status(500).json({ 
        error: error.message || "Deletion failed",
        details: error.stack 
      });
    }
  }
};

export const bulkDeleteFiles = async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const { fileNames } = req.body;
  
  console.log(`BULK DELETE REQUEST: ${eventId}, Files: ${fileNames.length}`);

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { userId: true },
    });

    if (!event) {
      console.log(`Event not found: ${eventId}`);
      return res.status(404).json({ error: "Event not found" });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: event.userId },
    });
    
    if (!user) {
      console.log(`User not found: ${event.userId}`);
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`Current storage: ${user.storageUsed}`);
    
    let totalSizeFreed = 0n;
    const deletionResults: {fileName: string, success: boolean, error?: string}[] = [];
    
    for (const fileName of fileNames) {
      try {
        const sizeFreed = await deleteSingleFile(eventId, fileName);
        totalSizeFreed += sizeFreed;
        deletionResults.push({ fileName, success: true });
        console.log(`Deleted ${fileName}, Size: ${sizeFreed}`);
      } catch (error: any) {
        console.error(`Error deleting ${fileName}:`, error);
        deletionResults.push({ 
          fileName, 
          success: false, 
          error: error.message 
        });
      }
    }

    console.log(`Total size freed: ${totalSizeFreed}`);
    
    const updatedUser = await prisma.user.update({
      where: { id: event.userId },
      data: { 
        storageUsed: { 
          decrement: totalSizeFreed 
        } 
      },
    });

    console.log(`Updated storage: ${updatedUser.storageUsed}`);

    // Verify storage was actually updated
    if (BigInt(updatedUser.storageUsed) !== BigInt(user.storageUsed) - totalSizeFreed) {
      console.error("Storage update mismatch!");
      console.error(`Expected: ${BigInt(user.storageUsed) - totalSizeFreed}`);
      console.error(`Actual: ${updatedUser.storageUsed}`);
    }

    res.status(200).json({
      message: "Bulk delete completed",
      count: fileNames.length,
      successCount: deletionResults.filter(r => r.success).length,
      sizeFreed: totalSizeFreed.toString(),
      newStorageUsed: updatedUser.storageUsed.toString(),
      results: deletionResults
    });
  } catch (error: any) {
    console.error("FULL BULK DELETE ERROR:", error);
    res.status(500).json({ 
      error: error.message || "Bulk delete failed",
      details: error.stack  
    });
  }
};


//cover image functions


export async function deleteAllCoverFiles(eventId: string): Promise<bigint> {
  await b2.authorize();
  const prefix = `events/${eventId}/cover/`;
  let continuationToken: string | undefined = undefined;
  let totalFreed = 0n;

  do {
    // ← Annotate listResult as ListObjectsV2CommandOutput
    const listResult:ListObjectsV2CommandOutput = await s3client.send(
      new ListObjectsV2Command({
        Bucket: process.env.BUCKET_NAME!,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      })
    );

    if (!listResult.Contents || listResult.Contents.length === 0) {
      break;
    }

    for (const obj of listResult.Contents) {
      if (!obj.Key) continue;
      const key = obj.Key; // e.g. "events/abcd1234/cover/filename.jpg"
      const fileName = key.split("/").pop()!; // "filename.jpg"
      try {
        // deleteSinglecoverFile expects (eventId, fileName)
        const freed = await deleteSinglecoverFile(eventId, fileName);
        totalFreed += freed;
        console.log(`🗑 Deleted cover file: ${key} (freed ${freed} bytes)`);
      } catch (err) {
        console.warn(`⚠️ Could not delete ${key}:`, (err as any).message);
      }
    }

    continuationToken = listResult.IsTruncated
      ? listResult.NextContinuationToken!
      : undefined;
  } while (continuationToken);

  return totalFreed;
}


export async function listCoverFiles(eventId: string): Promise<
  Array<{ url: string; name: string; type: string; size: number }>
> {
  const prefix = `events/${eventId}/cover/`;

  const listResult = await s3client.send(
    new ListObjectsV2Command({
      Bucket: process.env.BUCKET_NAME!,
      Prefix: prefix,
    })
  );

  if (!listResult.Contents || listResult.Contents.length === 0) {
    return [];
  }

  const mediaUrls = await Promise.all(
    listResult.Contents.map(async (file) => {
      const signed = await getSignedUrl(
        s3client,
        new GetObjectCommand({
          Bucket: process.env.BUCKET_NAME!,
          Key: file.Key!,
        }),
        { expiresIn: 3600 }
      );

      return {
        url: signed,
        name: file.Key!.split("/").pop()!,
        type: getcoverFileType(file.Key!),
        size: file.Size ?? 0,
      };
    })
  );

  return mediaUrls;
}

function getcoverFileType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (!ext) return "other";
  const imageExt = ["jpg", "jpeg", "png", "gif", "webp", "bmp"];
  const videoExt = ["mp4", "mov", "webm", "mkv", "avi", "flv", "wmv", "m4v", "is"];
  if (imageExt.includes(ext)) return "image";
  if (videoExt.includes(ext)) return "video";
  return "other";
}



export async function uploadCoverController(req: Request, res: Response) {
  const eventId = req.params.eventId;

  //Validate event exists
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { userId: true },
  });
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  try {
    //Parse multipart form (single file under field “file”)
    const form = formidable({
      multiples: false,
      keepExtensions: true,
      maxFileSize: MAX_FILE_SIZE,
      filter: (part) =>
        part.mimetype?.startsWith("image/") ||
        part.mimetype?.startsWith("video/") ||
        part.mimetype?.startsWith("audio/") ||
        part.mimetype === "text/plain",
    });

    const { files } = await new Promise<{
      fields: formidable.Fields;
      files: formidable.Files;
    }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    //Ensure exactly one file under “file”
    const fileField = files.file;
    if (!fileField) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    const fileArray = Array.isArray(fileField) ? fileField : [fileField];
    if (fileArray.length !== 1) {
      res
        .status(400)
        .json({ error: "Please upload exactly one cover file" });
      return;
      }
    const fileObj = fileArray[0] as formidable.File;
    if (!fileObj.filepath) {
      res.status(400).json({ error: "Invalid file upload" });
      return; 
    }

    //Delete any existing cover(s)
    try {
      await deleteAllCoverFiles(eventId);
    } catch (delErr) {
      console.warn(
        `⚠️  Could not delete old cover(s) for event ${eventId}:`,
        (delErr as any).message
      );
      //We proceed even if deletion “fails” (folder may have been empty).
    }

    // Upload the new one into Backblaze B2 (under events/${eventId}/cover/)
    const originalName =
      (fileObj.originalFilename as string) || path.basename(fileObj.filepath);
    await uploadcoverToB2(fileObj.filepath, eventId, originalName);

    //  Clean up the temp file from formidable
    try {
      if (fs.existsSync(fileObj.filepath)) {
        fs.unlinkSync(fileObj.filepath);
      }
    } catch (cleanupErr) {
      console.warn(
        "⚠️  Could not delete temp upload:",
        (cleanupErr as any).message
      );
    }

    //  List whatever is under /cover/ and return it
    const covers = await listCoverFiles(eventId);
    if (covers.length === 0) {
      // Should not happen immediately after a successful upload
      res
        .status(500)
        .json({ error: "Upload succeeded but no cover found" });
        return;
    }

    // Since we always deleted first, there should now be exactly one.
    res.status(200).json({ cover: covers[0] });
    return;
  } catch (err: any) {
    console.error("❌ uploadCoverController error:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to upload cover" });
    return;
    }
}



export async function getCoverController(req: Request, res: Response) {
  const eventId = req.params.eventId;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true },
  });
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  try {
    const covers = await listCoverFiles(eventId);
    res.status(200).json({ covers }); // covers is an array of length 0 or 1
    return;
  } catch (err: any) {
    console.error("❌ getCoverController error:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to list cover files" });
      return;
  }
}


export async function deleteCoverController(req: Request, res: Response) {
  const eventId = req.params.eventId;


  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { id: true },
  });
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  try {
    const freedSize = await deleteAllCoverFiles(eventId);
    return res.status(200).json({
      message: "Cover deleted",
      bytesFreed: freedSize.toString(),
    });
  } catch (err: any) {
    console.error("❌ deleteCoverController error:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to delete cover files" });
      return;
  }
}



//portfolio function
export async function uploadPortfolioCoverToB2(
  filePath: string,
  userId: string,
  originalFilename: string | null
): Promise<void> {
  const allowedExt = [
    ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp",
    ".mp4", ".mov", ".webm", ".mkv", ".avi", ".flv",
    ".txt", ".mp3", ".wav", ".ogg",
  ];

  if (!filePath || typeof filePath !== "string") {
    throw new Error("Invalid file path");
  }

  const ext = path.extname(filePath).toLowerCase();
  if (!allowedExt.includes(ext)) {
    throw new Error(`Invalid file type: ${ext}`);
  }

  const stats = await fs.promises.stat(filePath);
  if (stats.size > MAX_FILE_SIZE) {
    const gbLimit = (MAX_FILE_SIZE / (1024 * 1024 * 1024)).toFixed(2);
    throw new Error(`File exceeds ${gbLimit}GB limit`);
  }

    if (!fs.existsSync(filePath)) {
    throw new Error("Temporary file not found");
  }

  const fileName = path.basename(filePath);
  const remoteFileName = `portfolio/${userId}/cover/${fileName}`;

  await b2.authorize();
  const uploadUrlResponse = await b2.getUploadUrl({ bucketId: process.env.B2_BUCKET_ID! });

  const buffer = await fs.promises.readFile(filePath);

  await b2.uploadFile({
    uploadUrl: uploadUrlResponse.data.uploadUrl,
    uploadAuthToken: uploadUrlResponse.data.authorizationToken,
    fileName: remoteFileName,
    data: buffer,
  });

  console.log(`✅ Uploaded portfolio cover as ${remoteFileName}`);
}

export async function listPortfolioCoverFiles(
  userId: string
): Promise<Array<{ url: string; name: string; type: string; size: number }>> {
  const prefix = `portfolio/${userId}/cover/`;
  const listResult: ListObjectsV2CommandOutput = await s3client.send(
    new ListObjectsV2Command({
      Bucket: process.env.BUCKET_NAME!,
      Prefix: prefix,
    })
  );

  if (!listResult.Contents || listResult.Contents.length === 0) {
    return [];
  }

  const mediaUrls = await Promise.all(
    listResult.Contents.map(async (file) => {
      const signed = await getSignedUrl(
        s3client,
        new GetObjectCommand({
          Bucket: process.env.BUCKET_NAME!,
          Key: file.Key!,
        }),
        { expiresIn: 3600 }
      );
      return {
        url: signed,
        name: file.Key!.split("/").pop()!,
        type: getFileType(file.Key!),
        size: file.Size ?? 0,
      };
    })
  );

  return mediaUrls;
}

export async function deleteAllPortfolioCoverFiles(userId: string): Promise<bigint> {
  await b2.authorize();
  const prefix = `portfolio/${userId}/cover/`;
  let continuationToken: string | undefined = undefined;
  let totalFreed = 0n;

  do {
    const listResult: ListObjectsV2CommandOutput = await s3client.send(
      new ListObjectsV2Command({
        Bucket: process.env.BUCKET_NAME!,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      })
    );
    if (!listResult.Contents || listResult.Contents.length === 0) {
      break;
    }
    for (const obj of listResult.Contents) {
      if (!obj.Key) continue;
      const fileName = obj.Key.split("/").pop()!;
      try {
        const freed = await deleteSinglePortfolioCoverFile(userId, fileName);
        totalFreed += freed;
        console.log(`🗑 Deleted portfolio cover: ${obj.Key} (freed ${freed} bytes)`);
      } catch (err) {
        console.warn(`⚠️ Could not delete ${obj.Key}:`, (err as any).message);
      }
    }
    continuationToken = listResult.IsTruncated ? listResult.NextContinuationToken! : undefined;
  } while (continuationToken);

  return totalFreed;
}

export async function deleteSinglePortfolioCoverFile(
  userId: string,
  fileName: string
): Promise<bigint> {
  const fullFileName = `portfolio/${userId}/cover/${fileName}`;
  console.log(`Deleting single portfolio cover: ${fullFileName}`);
  try {
    const fileInfo = await getFileInfoByFileName(fullFileName);
    if (!fileInfo) {
      throw new Error("File not found");
    }
    const size = BigInt(fileInfo.contentLength);
    await b2.deleteFileVersion({ fileId: fileInfo.fileId, fileName: fullFileName });
    console.log(`Successfully deleted portfolio cover: ${fullFileName}`);
    return size;
  } catch (err) {
    console.error(`Error deleting file ${fullFileName}:`, err);
    throw err;
  }
}


export async function uploadPortfolioCoverController(req: Request, res: Response) {
 
  const { name } = req.params;
 
  const userId = req.query.userId as string;
  if (!userId) {
   res.status(400).json({ error: "Missing query parameter `userId`" });
  return;
  }

  console.log(`▶ uploadPortfolioCoverController for name="${name}", userId="${userId}"`);

  try {
       console.log("Received upload request for portfolio:", name);
    console.log("User ID:", userId);
    //  Parse the single “file” field
    const form = formidable({
      multiples: false,
      keepExtensions: true,
      maxFileSize: MAX_FILE_SIZE,
      filter: (part) =>
        part.mimetype?.startsWith("image/") ||
        part.mimetype?.startsWith("video/") ||
        part.mimetype?.startsWith("audio/") ||
        part.mimetype === "text/plain",
    });

    const { files } = await new Promise<{
      fields: formidable.Fields;
      files: formidable.Files;
    }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        err ? reject(err) : resolve({ fields, files });
      });
    });

    const fileField = files.file;
    if (!fileField) {
      res.status(400).json({ error: "No file uploaded" });
    return;
    }
    const fileArray = Array.isArray(fileField) ? fileField : [fileField];
    if (fileArray.length !== 1) {
       res
        .status(400)
        .json({ error: "Please upload exactly one cover file" });
    return;
      }
    const fileObj = fileArray[0] as formidable.File;
    if (!fileObj.filepath) {
     res.status(400).json({ error: "Invalid file upload" });
    return;
    }

    
    try {
      await deleteAllPortfolioCoverFiles(userId);
    } catch (delErr) {
      console.warn(
        `⚠️ Could not delete old portfolio cover(s) for userId="${userId}":`,
        (delErr as any).message
      );
    
    }

    //  Upload the new cover under `portfolio/<userId>/cover/...`
    const originalName = (fileObj.originalFilename as string) || path.basename(fileObj.filepath);

       console.log("Received file:", {
      originalFilename: fileObj.originalFilename,
      filepath: fileObj.filepath,
      mimetype: fileObj.mimetype,
      size: fileObj.size
    });


    await uploadPortfolioCoverToB2(fileObj.filepath, userId, originalName);

    // Clean up the temporary upload
    try {
      if (fs.existsSync(fileObj.filepath)) {
        fs.unlinkSync(fileObj.filepath);
      }
    } catch (cleanupErr) {
      console.warn("⚠️ Could not delete temp upload:", (cleanupErr as any).message);
    }

    // List the newly uploaded cover and return it
    const covers = await listPortfolioCoverFiles(userId);
    if (covers.length === 0) {
     res.status(500).json({ error: "Upload succeeded but no cover found" });
    return;
    }

     res.status(200).json({ cover: covers[0] });
    return;
    } catch (err: any) {
     console.error(" UPLOAD ERROR DETAILS:", {
      message: err.message,
      stack: err.stack,
      userId,
      name
    });
    res
      .status(500)
      .json({ error: err.message || "Failed to upload portfolio cover" });
    return;
    }
}

export async function getPortfolioCoverController(req: Request, res: Response) {
  const { name } = req.params;
  const userId = req.query.userId as string;
  if (!userId) {
    res.status(400).json({ error: "Missing query parameter `userId`" });
  return;
  }

  console.log(`▶ getPortfolioCoverController for name="${name}", userId="${userId}"`);
  try {
    const covers = await listPortfolioCoverFiles(userId);
    res.status(200).json({ covers });
  return;
  } catch (err: any) {
    console.error("❌ getPortfolioCoverController error:", err);
    res
      .status(500)
      .json({ error: err.message || "Failed to list portfolio cover files" });
    return;
    }
}

export async function deletePortfolioCoverController(
  req: Request,
  res: Response
) {
  const { name, fileName } = req.params;
  const userId = req.query.userId as string;
  if (!userId) {
  res.status(400).json({ error: "Missing query parameter `userId`" });
  return;
  }

  console.log(
    `▶ deletePortfolioCoverController name="${name}", userId="${userId}", fileName="${fileName}"`
  );
  try {
    const freedSize = await deleteSinglePortfolioCoverFile(userId, fileName);
    res.status(200).json({
      message: "Portfolio cover deleted",
      bytesFreed: freedSize.toString(),
    });
    return;
  } catch (err: any) {
    console.error("❌ deletePortfolioCoverController error:", err);
    if (err.message.includes("File not found")) {
       res.status(404).json({ error: "Cover file not found" });
      return;
      }
     res.status(500).json({ error: err.message || "Failed to delete cover file" });
     return;
  }
}




// Helper function to generate download URL
async function generateDownloadUrl(fileKey: string): Promise<string> {
  const bucketName = process.env.BUCKET_NAME;
  if (!bucketName) {
    throw new Error("B2_BUCKET_NAME environment variable is not set");
  }

  // generateDownloadUrl()
const command = new GetObjectCommand({
  Bucket: bucketName,
  Key: fileKey,
  ResponseContentDisposition: `attachment; filename="${path.basename(fileKey)}"`
});

  return getSignedUrl(s3client, command, { expiresIn: 3600 });
}


// Single File Download Handler
export async function downloadSingleFileHandler(req: Request, res: Response) {
  try {
    const { eventId, fileName } = req.params;
    
    if (!eventId || !fileName) {
      return res.status(400).json({ message: "Missing eventId or fileName" });
    }

    const fileKey = `events/${eventId}/${fileName}`;
    const downloadUrl = await generateDownloadUrl(fileKey);

    res.redirect(downloadUrl);
  } catch (error: any) {
    console.error("Download error:", error.message);
    res.status(500).json({ message: "Failed to generate download URL" });
  }
}

// Multiple Files Download Handler
export async function downloadMultipleFilesHandler(req: Request, res: Response) {
  try {
    const { eventId } = req.params;
    const { fileNames } = req.body;

    if (!eventId || !Array.isArray(fileNames) || fileNames.length === 0) {
      return res.status(400).json({ message: "Invalid request parameters" });
    }

    // Create zip archive
    const zip = new JSZip();
    const archive = archiver('zip', { zlib: { level: 9 } });

    // Set response headers
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${eventId}_media.zip"`);

    // Pipe archive to response
    archive.pipe(res);

    // Add files to archive
    for (const fileName of fileNames) {
      const fileKey = `events/${eventId}/${fileName}`;
      const downloadUrl = await generateDownloadUrl(fileKey);
      
      const response = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
      archive.append(response.data, { name: fileName });
    }

    // Finalize the archive
    await archive.finalize();
  } catch (error: any) {
    console.error("Bulk download error:", error.message);
    res.status(500).json({ message: "Failed to create zip file" });
  }
}

// Client-Side Multiple Download Handler (alternative to zip)
export async function getBulkDownloadUrlsHandler(req: Request, res: Response) {
  try {
    const { eventId } = req.params;
    const { fileNames } = req.body;

    if (!eventId || !Array.isArray(fileNames) || fileNames.length === 0) {
      return res.status(400).json({ message: "Invalid request parameters" });
    }

    const downloadUrls = await Promise.all(
      fileNames.map(async fileName => {
        const fileKey = `events/${eventId}/${fileName}`;
        return {
          fileName,
          url: await generateDownloadUrl(fileKey)
        };
      })
    );

    res.status(200).json(downloadUrls);
  } catch (error: any) {
    console.error("Bulk URL generation error:", error.message);
    res.status(500).json({ message: "Failed to generate download URLs" });
  }
}