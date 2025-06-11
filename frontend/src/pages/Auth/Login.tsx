
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { SignInFailure, SignInStart, SignInSuccess } from "@/redux/user/slice";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { loginService } from "@/services/AuthService";
import { LoginRequestModel, LoginResponseModel } from "@/models/Auth";
import CameraIllustration from "@/assets/illustrations/CameraIllustration";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "@/components/ui/Form/FormInput";
import captusLogo from "@/assets/logos/captus-logo.jpg";
import toast, { Toaster } from 'react-hot-toast';

const FormSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof FormSchema>;

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(FormSchema) });

  const handleFormSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      dispatch(SignInStart());
      const loginResponse: LoginResponseModel = await loginService({
        username: data.username,
        password: data.password,
      } as LoginRequestModel);
      
      toast.success("Login successful!");

      dispatch(SignInSuccess(loginResponse));

      navigate(`/dashboard/${loginResponse.username}`);
    } catch (err) {
      const errorStatus = err.status || 500;
      if(errorStatus === 404){
        toast.error("Invalid username or password.");
      }else{
        toast.error("An unexpected error occurred. Please try again later.");
      }
      dispatch(SignInFailure(err.message));
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const dispatch = useDispatch();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 relative overflow-hidden flex flex-col">
      {/* Animated background with neon orbs */}
      <div className="absolute inset-0">
        {/* Large floating orbs with neon glow */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-violet-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-2xl animate-pulse delay-500"></div>
        
        {/* Smaller accent orbs */}
        <div className="absolute top-32 right-32 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse delay-300"></div>
        <div className="absolute bottom-32 left-32 w-40 h-40 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl animate-pulse delay-700"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(139, 92, 246, 0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-purple-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 flex flex-1">
        {/* Left Column - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Glowing card with neon border effect */}
            <div className="relative group">
              {/* Neon glow background */}
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-40 animate-pulse transition duration-1000"></div>
              
              {/* Main card */}
              <div className="relative bg-gray-900/90 backdrop-blur-xl rounded-2xl border border-purple-500/30 shadow-2xl shadow-purple-500/20 p-8">
                {/* Captus Logo with glow */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-xl mb-4 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl blur-lg"></div>
                    <img
                      src={captusLogo}
                      alt="Captus"
                      className="relative object-contain rounded-xl"
                    />
                  </div>
                  <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
                    Welcome Back!
                  </h1>
                  <p className="text-gray-400 text-sm">Sign in to continue to your dashboard</p>
                </div>

                {/* Login Form */}
                <form
                  onSubmit={handleSubmit(handleFormSubmit)}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-purple-300">Username</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Enter username"
                        {...register("username")}
                        className="w-full px-4 py-3 bg-gray-800/50 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-white placeholder-gray-400 backdrop-blur-sm hover:border-purple-400/50"
                      />
                      {errors.username && (
                        <p className="text-red-400 text-sm mt-1">{errors.username.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-purple-300">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        {...register("password")}
                        className="w-full px-4 py-3 pr-12 bg-gray-800/50 border border-purple-500/30 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 text-white placeholder-gray-400 backdrop-blur-sm hover:border-purple-400/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                      {errors.password && (
                        <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="relative w-full group overflow-hidden rounded-lg p-[1px] transition-all duration-300 hover:scale-[1.02]"
                    >
                      {/* Animated gradient border */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-pulse"></div>
                      
                      {/* Button content */}
                      <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-semibold py-3 px-4 rounded-lg transition-all duration-300 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40">
                        {isLoading ? (
                          <div className="flex items-center justify-center">
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Logging in...
                          </div>
                        ) : (
                          "Login"
                        )}
                      </div>
                    </button>
                  </div>
                </form>

                {/* Forgot password link */}
                <div className="text-center mt-6">
                  <a href="#" className="text-sm text-purple-400 hover:text-purple-300 transition-colors hover:underline">
                    Forgot your password?
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Illustration */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative">
          <div className="relative max-w-lg w-full h-full flex items-center justify-center">
            {/* Glowing background for illustration */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-purple-500/10 rounded-2xl backdrop-blur-sm border border-purple-500/20"></div>
            
            {/* Illustration container with neon glow */}
            <div className="relative z-10 p-8 rounded-2xl">
              <CameraIllustration />
            </div>
            
            {/* Additional floating elements */}
            <div className="absolute top-10 right-10 w-4 h-4 bg-purple-400 rounded-full animate-pulse"></div>
            <div className="absolute bottom-10 left-10 w-3 h-3 bg-pink-400 rounded-full animate-pulse delay-500"></div>
            <div className="absolute top-1/3 left-8 w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-1000"></div>
          </div>
        </div>
      </div>

      {/* Footer with glow effect */}
      <div className="relative z-10 text-center pb-6">
        <p className="text-sm text-gray-400/80 backdrop-blur-sm">
          © 2025 Captus. All rights reserved.
        </p>
      </div>

      {/* Toast container */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(31, 41, 55, 0.9)',
            color: '#fff',
            border: '1px solid rgba(147, 51, 234, 0.3)',
            backdropFilter: 'blur(10px)',
          },
        }}
      />
    </div>
  );
};

export default Login;