export interface LoginRequestModel {
    username: string,
    password: string
}

export interface SignupRequestModel {
    email: string,
    password: string,
}

export interface LoginResponseModel {
    id : string,
    username : string,
};