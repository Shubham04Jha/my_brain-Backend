
import dotenv from 'dotenv';
dotenv.config();

export const port: number = 3000

export const DB_Url: string = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.dqdb1jj.mongodb.net/`;

export const JWT_SECRET: string = process.env.JWT_SECRET_KEY || 'jwtSecretAlt';

