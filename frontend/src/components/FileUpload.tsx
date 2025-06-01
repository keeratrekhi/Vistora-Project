import React, { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import axios from 'axios';
import { UploadInitiateResponse, UploadProgressProps } from '../types/upload';

const ORG_ID = "your-org-id";
const GALLERY_ID = "your-gallery-id";
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

export function FileUpload() {
  const [uploadState, setUploadState] = useState<UploadProgressProps>({
    progress: 0,
    status: 'idle',
    fileName: ''
  });

  const initiateUpload = async (file: File): Promise<UploadInitiateResponse> => {
    const response = await axios.post(`http://localhost:3000/api/media/${ORG_ID}/${GALLERY_ID}/initiate-upload`, {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        contentType: file.type,
        totalSize: file.size
      })
    });

    if (response.status !== 200) {
      throw new Error('Failed to initiate upload');
    }
    console.log('response from initiate api ',response.data);
    return response.data;
  };

  const uploadChunk = async (
    chunk: Blob,
    uploadId: string,
    partNumber: number,
    key: string
  ): Promise<void> => {
    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('uploadId', uploadId);
    formData.append('partNumber', partNumber.toString());
    formData.append('key', key);

    const response = await axios.post(`http://localhost:3000/api/media/${ORG_ID}/${GALLERY_ID}/upload-chunk`, {
      body : formData
    });

    if (response.status !== 200) {
      throw new Error(`Failed to upload chunk ${partNumber}`);
    }
  };

  const completeUpload = async (uploadId: string, key: string): Promise<void> => {
    const response = await axios.post(`http://localhost:3000/api/media/${ORG_ID}/${GALLERY_ID}/complete-upload?uploadId=${uploadId}&key=${encodeURIComponent(key)}`);

    if (response.status !== 200) {
      throw new Error('Failed to complete upload');
    }
  };

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      setUploadState({
        fileName: file.name,
        status: 'uploading',
        progress: 0
      });

      // Step 1: Initiate upload
      const { uploadId, key } = await initiateUpload(file);
      console.log('initiateUpload',uploadId,key);

      // Step 2: Upload chunks
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      
      for (let partNumber = 1; partNumber <= totalChunks; partNumber++) {
        const start = (partNumber - 1) * CHUNK_SIZE;
        const end = Math.min(file.size, start + CHUNK_SIZE);
        const chunk = file.slice(start, end);

        await uploadChunk(chunk, uploadId, partNumber, key);
        
        const progress = Math.round((partNumber / totalChunks) * 100);
        setUploadState(prev => ({
          ...prev,
          progress
        }));

        // await new Promise(resolve => setTimeout(resolve,
        //   1000)); // Simulate slow upload
      }

      // Step 3: Complete upload
      await completeUpload(uploadId, key);
      
      setUploadState(prev => ({
        ...prev,
        status: 'completed',
        progress: 100
      }));
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadState(prev => ({
        ...prev,
        status: 'error'
      }));
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <input
          type="file"
          onChange={handleFileChange}
          className="hidden"
          id="fileInput"
          accept="image/*,video/*"
        />
        
        {uploadState.status === 'idle' ? (
          <label
            htmlFor="fileInput"
            className="flex flex-col items-center cursor-pointer"
          >
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <span className="text-gray-600">Click to upload or drag and drop</span>
            <span className="text-sm text-gray-500 mt-1">
              Images or videos up to 100MB
            </span>
          </label>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium truncate max-w-[200px]">
                {uploadState.fileName}
              </span>
              <span className="text-gray-500">{uploadState.progress}%</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  uploadState.status === 'error'
                    ? 'bg-red-500'
                    : uploadState.status === 'completed'
                    ? 'bg-green-500'
                    : 'bg-blue-500'
                }`}
                style={{ width: `${uploadState.progress}%` }}
              />
            </div>

            {uploadState.status === 'completed' && (
              <p className="text-green-500 text-sm">Upload completed!</p>
            )}
            
            {uploadState.status === 'error' && (
              <p className="text-red-500 text-sm">
                Upload failed. Please try again.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}