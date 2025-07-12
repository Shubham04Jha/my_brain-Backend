import mongoose, {model, Schema} from 'mongoose';
import { DB_Url } from '../config.ts';

mongoose.connect(DB_Url).then(()=>console.log('connection successful')).catch((e)=>console.error(e));

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

export const userModel = model('user',userSchema,'users');

const tagSchema = new Schema({
  tag: {type: String, required: true, unique: true}
})

export const tagModel = model('tag',tagSchema,'tags');

const contentTypes = ['link','youtube','document','xpost'];

const contentSchema = new Schema({
  link: {type:String, required: true},
  type: {type:String, enum: contentTypes, required: true },
  thoughts: {type:String, required: false},
  title: {type: String, required: true},
  tags: [{type: Schema.Types.ObjectId, ref: 'tag'}],
  userId: {type: Schema.Types.ObjectId, ref: 'user',required: true },
  isPublic:{type:Boolean, default: false, required: true},
  createdAt: {type: Date, default: Date.now(), required: true}
})

export const contentModel = model('content', contentSchema,'contents');

const linkSchema = new Schema({
  
})