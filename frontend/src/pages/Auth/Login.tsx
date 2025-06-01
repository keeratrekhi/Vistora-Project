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
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col">
      {/* Background with abstract gradient shapes */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 flex flex-1">
        {/* Left Column - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl border-gray-200 border-2 shadow-black shadow-sm p-8">
              {/* Captus Logo */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-xl mb-2">
                  <img
                    src={captusLogo}
                    alt="Captus"
                    className="object-contain"
                  />
                </div>
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-br from-[#1C41B8] to-[#A6B5E2] bg-clip-text text-transparent">
                  Welcome Back!
                </h1>
              </div>

              {/* Login Form */}
              <form
                onSubmit={handleSubmit(handleFormSubmit)}
                className="space-y-6"
              >
                <div>
                  <FormInput
                    label="Username"
                    type="text"
                    name="username"
                    placeholder="Enter username"
                    register={register}
                    error={errors.username}
                    className="mt-1 w-full px-3 py-3 border border-gray-400 rounded-lg focus:ring-2 focus:ring-[#1C41B8] focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <div className="relative mt-1">
                    <FormInput
                      label="Password"
                      placeholder="Enter password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      register={register}
                      error={errors.password}
                      className="w-full px-3 py-3 pr-12 border border-gray-400 rounded-lg focus:ring-2 focus:ring-[#1C41B8] focus:border-transparent transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2/3 transform -translate-y-1/2 transition-colors text-[#A6B5E2]"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md
                    disabled:opacity-50 disabled:cursor-not-allowed text-white border-0 font-sans
                    hover:brightness-90
                    [background:linear-gradient(135deg,#1C41B8,#A6B5E2)]
                    ${isLoading ? "brightness-90" : ""}
                  `}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Logging in...
                      </div>
                    ) : (
                      "Login"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column - Wedding Photography Illustration */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative">
          <div className="max-w-lg w-full h-full flex items-center justify-center rounded-2xl p-8 [background:linear-gradient(135deg,rgba(28,65,184,0.1),rgba(166,181,226,0.1))]">
            <CameraIllustration />
          </div>
        </div>
      </div>

      {/* Footer - Now at bottom of screen */}
      <div className="relative z-10 text-center pb-2">
        <p className="text-sm text-gray-500">
          © 2025 Captus. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
