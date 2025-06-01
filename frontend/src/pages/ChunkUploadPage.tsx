import { FileUpload } from "../components/FileUpload";

const ChunkUploadPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Cloud Storage Upload
        </h1>
        <FileUpload />
      </div>
    </div>
  );
};

export default ChunkUploadPage;
