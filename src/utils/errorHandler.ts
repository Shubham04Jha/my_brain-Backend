import { MongooseError } from 'mongoose';
import {MongoServerError} from 'mongodb';
import type { Request, Response } from "express";


export const errorHandler = ( error: unknown, action: string, req?: Request, res?: Response): void=>{
    if(error instanceof MongoServerError){
        console.log('mongoDB error occured');
        console.error('MongoDB Error:', error.message);
        if (error.code === 11000) { // 11000 is the code for duplicate key error
            res?.status(409).json({ message: 'Entry already exists!' }); // 409 Conflict is a good status for duplicates
        } else {
            res?.status(500).json({ message: 'Database error: ' + error.message });
        }
    }else if(error instanceof MongooseError){
        console.log('Mongoose error occured');
        console.error('Mongoose Error:', error.message);
        res?.status(400).json({ message: 'Data validation error: ' + error.message }); 
    }else if(error instanceof Error){
        console.log('General error occured');
        console.error(error.message);
        res?.status(500).json({message:'unknown error'});
    }else{
        console.error(`Truly unknown error while ${action}:`, error);
        res?.status(500).json({ message: 'An unexpected internal server error occurred!' });
    }
    console.error(error);
    return;
}