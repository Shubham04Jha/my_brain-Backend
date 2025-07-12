//I don't know if I should git the migration file but its just for learning so I dont see any harm to put the migration logic on github.

import mongoose from "mongoose"
import { DB_Url } from "../../config.ts"
import { contentModel } from "../schema.ts";
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


const migration = async(): Promise<void> =>{
    try {
        await contentModel.updateMany(
            {isPublic: {$exists:false}},
            {$set: {isPublic:false}}
        )
        console.log('migration complete');
    } catch (error) {
        errorHandler(error,"migration");
    }
}

migration();