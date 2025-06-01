import { LoginRequestModel, LoginResponseModel } from "@/models/Auth";
import { APIService } from "./APIService";
const env = import.meta.env;

export const loginService = async (loginModel: LoginRequestModel): Promise<LoginResponseModel> => {
    const response = await APIService.post<LoginResponseModel, LoginRequestModel>(env.VITE_LOGIN_URL, loginModel);  
    return response.data;
};

// export const signupAction = async (signupModel: SignupRequestModel): Promise<APIResponse<string>> => {
//     return APIService.post<string, SignupRequestModel>(env.VITE_SIGNUP_API, signupModel);
// }