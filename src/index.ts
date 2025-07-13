
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import {port, JWT_SECRET} from './config.ts';
import {userModel, contentModel, tagModel } from './db/schema.ts';
import { userAuthMiddleware } from './middleware/userAuth.ts';
import { errorHandler } from './utils/errorHandler.ts';

const app = express();

app.use(express.json());

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
    } catch (error: unknown) {
        errorHandler(error,"signing up",req,res);
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

app.post('/api/v1/content',userAuthMiddleware, async(req,res): Promise<void> =>{
    //@ts-ignore
    const userId = req.userId;
    const {title,link,tags,thoughts,type} = req.body;
    try {
        tags?await contentModel.create({title,type,link,thoughts,tags, userId}):await contentModel.create({
            title,
            type,
            link,
            thoughts, 
            userId
        });
        res.status(200).json({message: 'Contents uploaded successfully'})
        return;
    } catch (error) {
        errorHandler(error,"posting contents",req,res);
    }
})

app.get('/api/v1/content',userAuthMiddleware, async(req,res): Promise<void> =>{
    //@ts-ignore
    const userId = req.userId;
    try {
        const response = await contentModel.find({userId}).populate(
            [{
                path:'tags',
                populate:{
                    path: 'tag',
                    select: 'tag'
                }
            },{path:'userId', select: 'username'}]);
        if(!response){
            res.status(404).json({message:'user does not exist'});
            return;
        }
        res.status(200).json({message: 'Contents delivered successfully',contents: response});
        return;
    } catch (error) {
        errorHandler(error,"fetching contents",req,res);
    }
})

app.post('/api/v1/tag',userAuthMiddleware,async(req,res): Promise<void>=>{
    //@ts-ignore
    const userId = req.userId;
    const tag = req.body.tag;
    try {
        const response = await tagModel.create({tag});
        res.status(200).json({message:'Successfully created the tag',tagId: response._id});
        return;
    } catch (error: unknown) {
        errorHandler(error,"creating tag",req,res);
    }
})

app.delete('/api/v1/content',userAuthMiddleware, async(req,res): Promise<void>=>{
    //@ts-ignore
    const userId = req.userId;
    const {contentId} = req.body;
    try {
        const response = await contentModel.findById(contentId);
        if(!response){
            res.status(404).json({message:'User does not exists in db. Error in deleting the content!'});
            return;
        }
        if(response.userId !=userId){
            res.status(403).json({message:'Trying to delete a doc you don’t own'});
            return;
        }
        await contentModel.findByIdAndDelete(contentId);
        res.status(200).json({message:'Content Deleted'});
        return;
    } catch (error) {
        errorHandler(error,'deleting content',req,res);
    }
})

app.post('/api/v1/share',userAuthMiddleware,(req,res)=>{
    //@ts-ignore
    const id = req.id;
    const share = req.body.share;
    
})

app.get('/',(req, res)=>{
    res.send('hello from ts');
})

app.listen(port,()=>{
    console.log(`server is listening on port: ${port}`);
})
