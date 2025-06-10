import { AlertCircle } from "lucide-react";

interface ErrorBannerProps {
  message: string;
}

const ErrorBanner = ({ message }: ErrorBannerProps) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center">
        <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
        <p className="text-red-700 font-['Poppins']">{message}</p>
      </div>
    </div>
  );
};

export default ErrorBanner;
