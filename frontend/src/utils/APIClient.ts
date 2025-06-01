import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { AUTH_TOKEN_KEY } from "../constants/LocalstorageConstants";
const env = import.meta.env;

export const axiosInstance = axios.create({
    baseURL: env.VITE_BASE_URL
})

axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {

        // if (config.url == env.VITE_LOGIN_API)
        //     config.params = { ...config.params, useCookies: true }
        // else
        //     config.withCredentials = true;

        const authToken = localStorage.getItem(AUTH_TOKEN_KEY);
        if (authToken) {
            config.headers.Authorization = `Bearer ${authToken}`;
        }

        config.headers.Authorization

        return config;
    },
    (error) => {
        console.error("Error occurred while sending request", error)
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {

        if (response.data?.accessToken)
            localStorage.setItem(AUTH_TOKEN_KEY, response.data.accessToken);

        return response;
    },
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            console.error("Unauthorized request");
        }

        return Promise.reject(error);
    }
);
