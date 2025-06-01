import { Request } from "express";

export const getUserIdFromCookie = (req : Request) => {
    //@ts-ignore
    return req.user?.userId;
}