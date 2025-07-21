import mongoose from 'mongoose';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: mongoose.Types.ObjectId
  }
  interface Response {
    userId?: mongoose.Types.ObjectId
  }
}