import { AUTH_TOKEN_KEY } from "../constants/LocalstorageConstants";

export const isAuthenticated = (): boolean => {
    const authToken = localStorage.getItem(AUTH_TOKEN_KEY);
    return !!authToken;
}