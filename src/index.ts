
import express from 'express';
import {port, JWT_SECRET} from './config.ts';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {userModel, contentModel } from './db/schema.ts';
import { userAuthMiddleware } from './middleware/userAuth.ts';
import { MongooseError } from 'mongoose';

const app = express();

app.use(express.json())

app.post('/api/v1/signup',async (req, res):Promise<void>=>{
    const {username,password} = req.body;
    if(!username||!password){
        res.status(411).json({message:'Error in inputs'});
        return;
    }
    try{
        const result = await userModel.findOne({username});
        if(result){
            res.status(403).json({message:'user already exists with this username.'});
            return;
        }
        const hashed_password = bcrypt.hashSync(password,10);
        await userModel.create({username,password: hashed_password});
        res.status(200).json({message:'User successfully signed up'});
        return;
    }catch(error){
        console.error(error);
        res.status(500).json({message:'Server Error'});
        return;
    }
})

app.post('/api/v1/signin',async(req, res): Promise<void> =>{
    const {username,password} = req.body;
    if(!username||!password){
        res.status(411).json({message:'username and password is required'});
        return;
    }
    try{
        const result = await userModel.findOne({username});
        if(!result){
            res.status(404).json({message: 'Error User not found'});
            return;
        }
        const hashed_password :string = result.password;
        if(!bcrypt.compareSync(password,hashed_password)){
            res.status(403).json({message:'wrong password'});
            return;
        }
        try {
            const token = jwt.sign({userId:result._id},JWT_SECRET,{expiresIn:'1d'});
            res.status(200).json({token});
            return;
        } catch (error) {
            res.status(500).json({message:'Error in token generation server'});
            return;
        }
    }catch(error){
        console.error(error);
        res.status(500).json({message:'Internal server error'});
        return;
    }
})

app.post('/api/v1/contents',userAuthMiddleware, async(req,res): Promise<void> =>{
    const {userId,title,link,tags,thoughts} = req.body;
    try {
        await contentModel.create({title,link,thoughts,tags, userId});
    } catch (error) {
        if(error instanceof MongooseError){
            res.status(500).json({message: error.message});
            return;
        }else{
            res.status(500).json({message:'unexpected internal server error while posting contents!'});
            return;
        }
    }
    res.status(200).json({message: 'Contents uploaded successfully'})
    return;
})

app.get('/api/v1/contents',userAuthMiddleware, async(req,res): Promise<void> =>{
    const userId = req.body.userId;
    try {
        const response = await contentModel.find({userId}).populate([
            {path: 'user', select: 'username'},
            {path:'tags', select: 'tag'}
        ]);
        if(!response){
            res.status(404).json({message:'user does not exist'});
            return;
        }

        res.status(200).json({message: 'Contents delivered successfully',contents: response});
        return;
    } catch (error) {
        if(error instanceof MongooseError){
            res.status(500).json({message: error.message});
            return;
        }else{
            res.status(500).json({message:'unexpected internal server error while posting contents!'});
            return;
        }
    }
})


app.get('/',(req, res)=>{
    res.send('hello from ts');
})

app.listen(port,()=>{
    console.log(`server is listening on port: ${port}`);
})
