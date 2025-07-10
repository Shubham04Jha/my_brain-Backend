
import express from 'express';
import {port,DB_Url, JWT_SECRET} from './config.ts';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {userModel} from './schemas/schema.ts';

const app = express();

app.use(express.json())

app.post('/api/v1/signup',async (req, res):Promise<any>=>{
    const {username,password} = req.body;
    if(!username||!password) return res.status(411).json({message:'Error in inputs'});
    try{
        const result = await userModel.findOne({username});
        if(result){
            return res.status(403).json({message:'user already exists with this username.'});
        }
        const hashed_password = bcrypt.hashSync(password,10);
        await userModel.create({username,password: hashed_password});
        return res.status(200).json({message:'User successfully signed up'});
    }catch(error){
        console.error(error);
        return res.status(500).json({message:'Server Error'});
    }
})

app.post('/api/v1/signin',async(req, res): Promise<any> =>{
    const {username,password} = req.body;
    if(!username||!password) return res.status(411).json({message:'username and password is required'});
    try{
        const result = await userModel.findOne({username});
        if(!result){
            return res.status(404).json({message: 'Error User not found'});
        }
        const hashed_password :string = result.password;
        if(!bcrypt.compareSync(password,hashed_password)){
            return res.status(403).json({message:'wrong password'});
        }
    }catch(error){
        console.error(error);
        return res.status(500).json({message:'Internal server error'})
    }
    try {
        const token = jwt.sign({username},JWT_SECRET,{expiresIn:'1d'});
        return res.status(200).json({token});
    } catch (error) {
        return res.status(500).json({message:'Error in token generation server'});
    }
})

app.get('/',(req, res)=>{
    res.send('hello from ts');
})

app.listen(port,()=>{
    console.log(`server is listening on port: ${port}`);
})

mongoose.connect(DB_Url).then(()=>console.log('connection successful')).catch((e)=>console.error(e));
