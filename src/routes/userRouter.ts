import { Router } from "express";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { JWT_SECRET} from '../config.ts';
import {userModel } from '../db/schema.ts';
import { errorHandler } from '../utils/errorHandler.ts';
import type {Request,Response} from "express";
import { userAuthMiddleware } from "../middleware/userAuth.ts";

const router = Router();

router.post('/signup',async (req: Request, res: Response):Promise<void>=>{
    if(!req.body){
        res.status(403).json({message:'Body not found, Try adding headers to the request.'});
        return;
    }
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

router.post('/signin',async(req: Request, res: Response): Promise<void> =>{
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

router.get('/isAuthenticated',userAuthMiddleware, async (req: Request,res: Response): Promise<void>=>{
    try {
        const response = await userModel.findById(req.userId);
        if(!response){
            res.status(404).json({authenticated: false,message:'User Not Found!'});
            return;
        }
        const username = response.username;
        res.status(200).json({authenticated: true,username: username});
        return;
    } catch (error) {
        errorHandler(error,'searching for username');
    }
})


router.post('/share',userAuthMiddleware, async (req: Request,res: Response ):Promise<void>=>{
    
    const userId = req.userId;
    const share = req.body.share;
    try {
        await userModel.findByIdAndUpdate(userId,{$set:{publicShare:share}});
        res.status(200).json({message:'Successfully updated share status'});
        return;
    } catch (error) {
        errorHandler(error,'sharing brian',req,res);
    }
})

// this api changed
router.get('/sharedBrains',userAuthMiddleware, async (req: Request,res: Response): Promise<void> =>{
    try {
        const user = await userModel.findById(req.userId);
        if(!user){
            res.status(404).json({message:'User not found'});
            return;
        }
        res.status(200).json({message:'Successful!',sharedBrains: user.sharedBrains})
    } catch (error) {
        errorHandler(error,'searching Shared Brains');
    }
})

router.post('/sharedBrains',userAuthMiddleware, async (req: Request, res: Response): Promise<void> =>{
    
    try {
        const {sharedBrain} = req.body;
        if(!sharedBrain){
            res.status(403).json({message:'sharedBrain cannot be empty'});
            return;
        }
        const user = await userModel.findById(req.userId);
        if(!user){
            res.status(404).json({message:'User not found'});
            return;
        }
        const otherUser = await userModel.findOne({username:sharedBrain});
        if(!otherUser){
            res.status(404).json({message:'Brain does not exists'});
            return;
        }
        if(user.sharedBrains.includes(sharedBrain)){
            res.status(200).json({message:'Brain Already existed'});
            return;
        }
        user.sharedBrains.push(sharedBrain);
        user.save();
        res.status(200).json({message:'Successfully added the brain!'})
    } catch (error) {
        errorHandler(error,'searching Shared Brains');
    }
})

// this api changed
router.get('/checkPublicStatus/:username', async(req: Request, res: Response): Promise<void>=>{
    try {
        const user = await userModel.findOne({username:req.params.username});
        res.status(200).json({publicShare:user?user.publicShare:false});
    } catch (error) {
        errorHandler(error,'checking public status');
        res.status(500).json({message:'Server Error'});
    }
})

export default router;