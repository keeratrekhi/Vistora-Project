export interface UploadInitiateResponse {
    uploadId: string;
    key: string;
    mediaId: string;
  }
  
  export interface UploadProgressProps {
    progress: number;
    status: "idle" | "uploading" | "completed" | "error";
    fileName: string;
  }
  