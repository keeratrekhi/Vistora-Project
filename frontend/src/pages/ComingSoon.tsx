import { Rocket } from "lucide-react";

const ComingSoon = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex justify-center mb-8">
          <Rocket className="w-20 h-20 text-white animate-bounce" />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Coming Soon
        </h1>
        <p className="text-xl text-white/90 mb-8 max-w-md mx-auto">
          Portfolio is under construction. Something amazing is in the works!
        </p>
      </div>
    </div>
  );
};

export default ComingSoon;
