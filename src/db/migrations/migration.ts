//I don't know if I should git the migration file but its just for learning so I dont see any harm to put the migration logic on github.

import mongoose from "mongoose"
import { DB_Url } from "../../config.ts"
import { contentModel, userModel } from "../schema.ts";
import { errorHandler } from "../../utils/errorHandler.ts";

mongoose.connect(DB_Url).then(()=>{
    console.log('connected to db for migration');
}).catch((error)=>{
    if(error instanceof Error){
        console.error(error.message);
    }else{
        console.log('error occured');
        console.error(error);
    }
})


const isPublicMigration = async(): Promise<void> =>{
    try {
        await contentModel.updateMany(
            {isPublic: {$exists:true}},
            {$set: {isPublic:true}}
        )
        console.log('migration complete');
    } catch (error) {
        errorHandler(error,"isPublicMigration");
    }
}
const createdAtMigration = async(): Promise<void> =>{
    try{
        contentModel.updateMany(
            {createdAt: {$exists: false}},
            {$set: {createdAt: Date.now()}}
        ).exec();
    }catch(error){
        errorHandler(error,"migration to add createAtField");
    }
}

const publicShareMigration = async(): Promise<void> =>{
    try {
        await userModel.updateMany({publicShare: {$exists: false}},
            { $set:{publicShare: false}});
    } catch (error) {
        errorHandler(error,'migration for publicShare link');
    }
}

const SharedBrainFieldmigration = async(): Promise<void> =>{
    try{
        await userModel.updateMany({sharedBrains: {$exists: true}},
            {$set: {sharedBrains: []}}
        );
        console.log('migration complete');
    }catch(error){
        errorHandler(error,'migrating for addition of sharedBrains');
    }
}
const migration = ()=>{
    console.log('empty migration');
}
migration();