import { axiosInstance } from "../utils/APIClient";

export interface APIResponse<T> {
    data: T;
    statusCode: number;
}

export const APIService = {
    get: async <T>(url: string, params?: Record<string, any>): Promise<APIResponse<T>> => {
        const response = await axiosInstance.get<T>(url, {
            params,
            withCredentials: true
        });
        return { data: response.data, statusCode: response.status };
    },

    post: async <T, B>(url: string, body: B): Promise<APIResponse<T>> => {
        const response = await axiosInstance.post<T>(url, body, {
            withCredentials: true
        });
        return { data: response.data, statusCode: response.status };
    },

    put: async <T, B>(url: string, body: B): Promise<APIResponse<T>> => {
        const response = await axiosInstance.put<T>(url, body,{
            withCredentials: true
        });
        return { data: response.data, statusCode: response.status };
    },

    delete: async <T>(url: string): Promise<APIResponse<T>> => {
        const response = await axiosInstance.delete<T>(url);
        return { data: response.data, statusCode: response.status };
    },
};