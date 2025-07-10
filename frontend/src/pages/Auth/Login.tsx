import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { SignInFailure, SignInStart, SignInSuccess } from "@/redux/user/slice";
import { Eye, EyeOff } from "lucide-react";
import { loginService } from "@/services/AuthService";
import { LoginRequestModel, LoginResponseModel } from "@/models/Auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "@/components/ui/Form/FormInput";
import toast from "react-hot-toast";
import GeometricDecorations from "@/components/GeometricDecorations";


const FormSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof FormSchema>;

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
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
      
      toast.success("Login Successful")

      dispatch(SignInSuccess(loginResponse));
      navigate(`/dashboard/${loginResponse.username}`);
    } catch (err: any) {
      const errorStatus = err.status || 500;
      if(errorStatus === 404){
        toast.error("Authentication Error")
      } else {
        toast.error("Unexpected Error")
      }
      dispatch(SignInFailure(err.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden flex items-center justify-center">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-2xl animate-pulse" style={{animationDelay: '4s'}}></div>
        
        {/* Additional ambient lighting */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-float opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 flex items-center justify-center">
        {/* Left Geometric Decorations */}
        <div className="hidden lg:block lg:w-1/3 relative h-96">
          <GeometricDecorations side="left" />
        </div>

        {/* Center - Login Form */}
        <div className="w-full lg:w-1/3 flex items-center justify-center">
          <div className="w-full max-w-md animate-fade-in" style={{animationDelay: '0.3s'}}>
            <div className="bg-slate-800/90 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl p-8 hover:shadow-purple-500/20 transition-all duration-500 hover:scale-[1.02] relative overflow-hidden">
              {/* Subtle inner glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 rounded-3xl"></div>
              
              <div className="relative z-10">
                {/* Vistora Logo */}
                <div className="text-center mb-8 animate-fade-in" style={{animationDelay: '0.5s'}}>
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 bg-gradient-to-br from-purple-500 to-pink-500 p-1 animate-pulse-glow">
                    <div className="w-full h-full bg-slate-800 rounded-xl flex items-center justify-center">
                      <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">V</span>
                    </div>
                  </div>
                  <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-x bg-size-200">
                    Welcome Back!
                  </h1>
                  <p className="text-slate-400 animate-fade-in" style={{animationDelay: '0.7s'}}>
                    Sign in to continue to Vistora
                  </p>
                </div>

                {/* Login Form */}
                <form
                  onSubmit={handleSubmit(handleFormSubmit)}
                  className="space-y-6 animate-fade-in"
                  style={{animationDelay: '0.9s'}}
                >
                  <div className="transform hover:scale-[1.02] transition-all duration-300 hover:translate-y-[-2px]">
                    <FormInput
                      label="Username"
                      type="text"
                      name="username"
                      placeholder="Enter your username (Demo Username - kk)"
                      register={register}
                      error={errors.username}
                      className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white  placeholder-slate-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 hover:bg-slate-700/70 hover:border-slate-500"
                    />
                  </div>

                  <div className="transform hover:scale-[1.02] transition-all duration-300 hover:translate-y-[-2px]">
                    <div className="relative">
                      <FormInput
                        label="Password"
                        placeholder="Enter your password (Demo Pass - 12345)"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        register={register}
                        error={errors.password}
                        className="w-full px-4 py-3 pr-12 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 hover:bg-slate-700/70 hover:border-slate-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-purple-400 transition-all duration-200 hover:scale-110 mt-3 focus:outline-none focus:text-purple-400"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-1 shadow-lg hover:shadow-2xl
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-white border-0 relative overflow-hidden
                      bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-size-200 animate-gradient-x
                      hover:shadow-purple-500/25 focus:ring-4 focus:ring-purple-500/50 focus:outline-none
                      ${isLoading ? "animate-pulse" : ""}
                    `}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
                      <div className="relative z-10">
                        {isLoading ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Signing you in...</span>
                          </div>
                        ) : (
                          <span className="flex items-center justify-center space-x-2 group">
                            <span>Sign In</span>
                            <span className="transform transition-transform group-hover:translate-x-1">→</span>
                          </span>
                        )}
                      </div>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Right Geometric Decorations */}
        <div className="hidden lg:block lg:w-1/3 relative h-96">
          <GeometricDecorations side="right" />
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center animate-fade-in" style={{animationDelay: '1.2s'}}>
        <p className="text-sm text-slate-400">
          © 2025 <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-medium">Vistora</span>. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;