
import type { NextFunction, Request,Response } from "express";
import { JWT_SECRET } from "../config.ts";
import jwt from "jsonwebtoken";
import type {  JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";

const {  JsonWebTokenError } = jwt;
interface Tokenpayload extends JwtPayload{
    userId: string;
}
export const userAuthMiddleware = ((req: Request, res: Response, next: NextFunction): void=>{
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Authorization token missing or malformed', 
            received: authHeader
        });
        return;
    }
    const token: string = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token,JWT_SECRET);
        if(typeof decoded == 'string'){
            res.status(400).json({message:'JWT payload is a string not an object'});
            return;
        }
        const decodedPayload = decoded as Tokenpayload;
        req.userId = new mongoose.Types.ObjectId(decodedPayload.userId);
    } catch (error: unknown) {
        if (error instanceof JsonWebTokenError) { 
            console.log(error.message);
            console.error(error);
            res.status(403).json({ message: error.message });
            return;
        } else {
            console.error("An unexpected error occurred:", error);
            res.status(500).json({ message: 'An unexpected server error occurred' });
            return;
        }
    }
    next();
})