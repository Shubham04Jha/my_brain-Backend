import { Router } from "express";
import { userAuthMiddleware } from "../middleware/userAuth.ts";
import { contentModel } from "../db/schema.ts";
import { getEmbedding } from "../utils/getEmbeddings.ts";
import { errorHandler } from "../utils/errorHandler.ts";
import { Types } from "mongoose";

const router = Router();

router.post('/vectorSearch',userAuthMiddleware,async (req,res)=>{
    const {query} = req.body;
    try {
        const queryEmbedding = await getEmbedding(query);
        if(!queryEmbedding){
            res.status(500).json({message:"Error while vector searching!"});
            return;
        }
        const results = await contentModel.aggregate([
            {
                $vectorSearch: {
                    index: "embedding",
                    queryVector: queryEmbedding,
                    path: "embedding",
                    exact: true,
                    limit: 5,
                    filter:{"userId": new Types.ObjectId(req.userId) }
                }
            },
            {
                $lookup:{
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userId'
                }
            },
            { $unwind: '$userId'},
            {
                $lookup: {
                    from: 'tags',
                    localField: 'tags',
                    foreignField: '_id',
                    as: 'tags'
                }
            },
            {
                $addFields: {
                    score: { $meta: "vectorSearchScore" }
                }
            },
            {
                $match: {
                    score: { $gte: 0.7 } 
                }
            },
            {
                $project: {
                    title: 1,
                    tags: 1,
                    link: 1,
                    thoughts: 1,
                    type: 1,
                    score: 1,
                    'userId._id': 1,
                    'userId.username': 1
                }
            }
        ]);
        res.status(200).json({results});
        return;
    } catch (error) {
        errorHandler(error,"vector searching the query: "+query,req,res);
    } 
})

export default router;