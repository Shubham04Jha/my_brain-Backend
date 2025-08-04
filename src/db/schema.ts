import mongoose, {model, Schema} from 'mongoose';
import { DB_Url } from '../config.ts';

mongoose.connect(DB_Url).then(()=>console.log('connection successful')).catch((e)=>console.error(e));

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  publicShare: {type: Boolean, required: true, default: false},
  sharedBrains: [{type: String}],
});

export const userModel = model('user',userSchema,'users');

const tagSchema = new Schema({
  tag: {type: String, required: true, unique: true}
})

export const tagModel = model('tag',tagSchema,'tags');

const contentTypes = ['link','youtube','document','x'];

const contentSchema = new Schema({
  link: {type:String, required: true},
  type: {type:String, enum: contentTypes, required: true },
  thoughts: {type:String, required: false},
  title: {type: String, required: true},
  tags: [{type: Schema.Types.ObjectId, ref: 'tag',
      validate: async function(value: Schema.Types.ObjectId) {
        const tag = await tagModel.findById(value);
        if (!tag) {
          throw new Error('Tag does not exist');
        }
      }
  }],
  userId: {type: Schema.Types.ObjectId, ref: 'user',required: true,
      validate: async function(value: Schema.Types.ObjectId) {
        const user = await userModel.findById(value);
        if (!user) {
          throw new Error('User does not exist');
        }
      }
   },
  isPublic:{type:Boolean, default: false, required: true},
  createdAt: {type: Date, default: Date.now(), required: true}
})

export const contentModel = model('content', contentSchema,'contents');


/**
 * someone shares content.
 * they specify when should it expire or never if that's the case... nah the expiry things make it complicated.... 
 * why? cuz each time someone create a expire after 1 day link we gonna create a new entry in the db. but that can also be thought of as a feature share different people different amount of time they can access your brain... but If I did want that granular access then shouldn't I just allow an array of viewers for the  nah I think I am going out of focus... or should I let the user see how many links they have created and when it is each of them expires in ascending amount of time... he may revoke the links at will or create a new one for different time line. just a dev oriented feature... just to do it... But I dont think I would 
 * but then again lets forget this nonsense and move forward with sharable link. you set it to true or false your wish. why then have a link shcema? can't I just use the userTable to include a field public Share true? but then suppose I want to share the specific content? but what is a content?... its just some links anyways... so why would I want to selectively decide whom to share it with when I can just whatsapp them?
 *  yea no sense... its not a document sharing platform like notion.. its main objective is to store links and some data associated with it. and then allow me to search from it. Like I paste links to resources in my personal whatsapp number.
 * and maybe in future allow for a nl response. if it even makes sense?
 * 
 * I have decided we dont need linkSchema
 */
// const linkSchema = new Schema({
//   hash: {type: String, unique: true, required: true},
//   userId: {type: Schema.Types.ObjectId, ref: 'user', required: true}
// })

