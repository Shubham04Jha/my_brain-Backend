import { Router } from "express";
import {userModel, contentModel, tagModel } from '../db/schema.ts';
import { userAuthMiddleware } from '../middleware/userAuth.ts';
import { errorHandler } from '../utils/errorHandler.ts';

import type {Request,Response} from "express";

const router = Router();
router.post('/',userAuthMiddleware, async(req: Request,res: Response): Promise<void> =>{
    
    const userId = req.userId;
    const {title,link,tags,thoughts,type,isPublic} = req.body;
    try {
        const response = await contentModel.create({
            title,
            type,
            link,
            thoughts, 
            userId,
            ...isPublic&&{isPublic},
            ...tags&&{tags}
        });
        res.status(200).json({message: 'Contents uploaded successfully',content: response});
        return;
    } catch (error) {
        errorHandler(error,"posting contents",req,res);
    }
})

router.get('/',userAuthMiddleware, async(req: Request,res: Response): Promise<void> =>{
    
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

//careful here ...
router.get('detail/:contentId',userAuthMiddleware,async(req: Request,res: Response): Promise<void> =>{
    const userId = req.userId;
    const {contentId} = req.params;
    try {
        if(!contentId){
            res.status(403).json({message: 'contentId missing'});
            return;
        }
        const content = await contentModel.findById(contentId).populate({path:'userId',select:'username'});
        if(!content){
            res.status(404).json({message: 'content does not exists'});
            return;
        }
        const contentOwnerId = content.userId._id;
        if(!contentOwnerId.equals(userId) ){
            res.status(403).json({message:'Accessing content you dont own'});
            return;
        }
        res.status(200).json({content});
    } catch (error) {
        errorHandler(error,'getting shared content',req,res);
        return;
    }
})

router.put('/:contentId',userAuthMiddleware,async (req: Request,res: Response): Promise<void> =>{
    const userId = req.userId;
    const contentId = req.params.contentId;
    const content = await contentModel.findById(contentId);
    const {title,thoughts} = req.body;
    if(!title||!thoughts){
        res.status(403).json({message:'title and thoughts required'});
        return;
    }
    if(!content){
        res.status(404).json({message: 'Content not found'});
        return;
    }
    if(!content.userId.equals(userId)){
        res.status(409).json({message: 'Editing content you don\'t own'});
        return;
    }
    content.title=title;
    content.thoughts =thoughts;
    content.save();
    res.status(200).json({message: 'Success'});
    return;
})

router.delete('/',userAuthMiddleware, async(req: Request,res: Response ): Promise<void>=>{
    
    const userId = req.userId;
    const {contentId} = req.body;
    try {
        const response = await contentModel.findById(contentId);
        if(!response){
            res.status(404).json({message:'User does not exists in db. Error in deleting the content!'});
            return;
        }
        if(!response.userId.equals(userId)){
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


router.put('/ispublic/:contentId',userAuthMiddleware, async(req: Request,res: Response ):Promise<void> =>{
    
    const userId = req.userId;
    const contentId = req.params.contentId;
    const isPublic = req.body.isPublic;
    try {
        const content = await contentModel.findById(contentId);
        if(!content){
            res.status(404).json({message:'Content not found'});
            return;
        }
        if(!content.userId.equals(userId)){
            res.status(403).json({message:'Updating content you don\'t own'});
            return;
        }
        content.isPublic = isPublic;
        content.save();
        res.status(200).json({message:'update successful'});
        return;
    } catch (error) {
        errorHandler(error,'Updated the ispublic value successfully');
    }
})

// this api changed
router.post('/tag',userAuthMiddleware,async(req: Request,res: Response ):Promise<void>=>{
    
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


// this api changed
router.get('/share/:username',async (req: Request, res: Response): Promise<void>=>{
    const username = req.params.username;
    try {
        const response = await userModel.findOne({username});
        if(!response){
            res.status(404).json({message:'Owner of the brain not found in database!'});
            return;
        }
        if(!response.publicShare){
            res.status(403).json({message:'Owner has not allowed sharing'});
            return;
        }
        const contentResponse = await contentModel.find({userId:response._id,isPublic:true}).populate([
            {path:'userId', select:'username'},{path:'tags',populate:{path:'tag',select:'tag'}}
        ]);
        res.status(200).json({message:'The public contents of the shared brain found',username,content:contentResponse});
        return;
    } catch (error) {
        errorHandler(error,'accessing sharedBrain');
    }
})


router.get('/shareContent/:contentId',async(req: Request,res: Response): Promise<void> =>{
    const {contentId} = req.params;
    try {
        if(!contentId){
            res.status(403).json({message: 'contentId missing'});
            return;
        }
        const content = await contentModel.findById(contentId).populate({path:'userId',select:'username'});
        if(!content?.isPublic){
            res.status(404).json({message: 'content does not exists or is not public'});
            return;
        }
        res.status(200).json({content});
    } catch (error) {
        errorHandler(error,'getting shared content',req,res);
        return;
    }
})



export default router;