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
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PrismaClient } from "@prisma/client";
import * as crypto from 'crypto';
import { promisify } from 'util';

dotenv.config();


// Promisify stream pipeline and other functions
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);

// ... other imports and existing code ...

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

  const ext = path.extname(filePath).toLowerCase();
  if (!allowedExt.includes(ext)) throw new Error(`Invalid file type: ${ext}`);

  const stats = await stat(filePath);
  if (stats.size > MAX_FILE_SIZE) {
    throw new Error(`File exceeds ${MAX_FILE_SIZE / 1024 / 1024 / 1024}GB limit`);
  }

  const fileName = path.basename(filePath);
  const remoteFileName = `events/${eventId}/${fileName}`;

  await b2.authorize();

  // For files larger than 1GB, use chunked upload
  if (stats.size > 1000 * 1024 * 1024) {
    await uploadLargeFile(filePath, remoteFileName);
  } else {
    await uploadSingleFile(filePath, remoteFileName);
  }

  console.log(`✅ Uploaded file as ${remoteFileName}`);

   } catch (error:any) {
    console.error("❌ Backblaze B2 Upload Error:", {
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

    // Rest of your existing controller logic
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.BUCKET_NAME!,
      Prefix: directory,
    });

    const listResult = await s3client.send(listCommand);

    if (!listResult.Contents) {
      return res.status(404).json({ error: "Directory not found" });
    }

    const mediaUrls = await Promise.all(
      listResult.Contents.map(async (file) => {
        const url = await getSignedUrl(
          s3client,
          new GetObjectCommand({
            Bucket: process.env.BUCKET_NAME!,
            Key: file.Key!,
          }),
          { expiresIn: 3600 }
        );

        // const headCommand = new HeadObjectCommand({
        // Bucket: "Testing178293423523221",
        // Key: file.Key!,
        //   });
        // const headResult = await s3client.send(headCommand);

        return {
          url,
          name: file.Key!.split("/").pop(),
          type:  getFileType(file.Key!),
          size: file.Size
        };
      })
    );
    console.log("Listed files:", listResult.Contents.map(f => 
  `${f.Key} (${f.Size} bytes)`
    ));



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



// Add this helper function to validate BigInt values
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

// Delete entire event folder
export async function deleteEventFolder(eventId: string): Promise<bigint> {
  await b2.authorize();
  const prefix = `events/${eventId}/`;
  let nextFileName: string = ''; // Initialize as empty string
  const files: any[] = [];
  let totalSize = 0n;

  try {
    do {
      const listOpts = {
        bucketId: process.env.B2_BUCKET_ID!,
        prefix,
        delimiter: '/',
        startFileName: nextFileName,
        maxFileCount: 1000
      };

      const response = await b2.listFileNames(listOpts);
      files.push(...response.data.files);
      nextFileName = response.data.nextFileName || '';
    } while (nextFileName);

    for (const file of files) {
      // Get full file info including size
      const fileDetails = await b2.getFileInfo({
        fileId: file.fileId
      });
      
      const size = BigInt(fileDetails.data.contentLength);
      totalSize += size;
      
       await b2.deleteFileVersion({
        fileId: file.fileId,
        fileName: file.fileName,
      });
      
      console.log(`Deleted ${file.fileName}, Size: ${size}`);
    }

    return totalSize;
  } catch (error) {
    console.error(`Error deleting event folder ${eventId}:`, error);
    throw error;
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

// Updated route handlers with comprehensive checks:

export const deleteEvent = async (req: Request, res: Response) => {
  const { eventId } = req.params;
  console.log(`DELETE EVENT REQUEST: ${eventId}`);

  try {
    // 1. Fetch event and verify ownership
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { userId: true },
    });

    if (!event) {
      console.log(`Event not found: ${eventId}`);
      return res.status(404).json({ error: "Event not found" });
    }

    // 2. Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: event.userId },
    });

    if (!user) {
      console.log(`User not found for event: ${event.userId}`);
      return res.status(404).json({ error: "User not found" });
    }

    console.log(`Current storage for user ${user.id}: ${user.storageUsed}`);

    // 3. Delete media files from storage
    const sizeFreed = await deleteEventFolder(eventId);
    console.log(`Size freed: ${sizeFreed}`);

    // 4. Update user's storage using atomic decrement
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

    // 5. Delete the event record from database
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