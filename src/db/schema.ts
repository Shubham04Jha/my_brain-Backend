import mongoose, {model, Schema} from 'mongoose';
import { DB_Url } from '../config.ts';
import { getEmbedding } from '../utils/getEmbeddings.ts';
import { errorHandler } from '../utils/errorHandler.ts';

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
  embedding: { type: [Number] },
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
  createdAt: {type: Date, default: Date.now, required: true}
})

contentSchema.pre("save", async function (next) {
  if (this.isModified("title") || this.isModified("thoughts")) {
    const combined = `${this.title} ${this.thoughts||''}`;
    try {
      this.embedding = await getEmbedding(combined)||[-1];
    } catch (error) {
      errorHandler(error,"preSaving at contentSchema");
    }
  }
  next();
});

export const contentModel = model('content', contentSchema,'contents');



