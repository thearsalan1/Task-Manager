import { IUser } from './../Types/types';
import mongoose, { model, Schema } from "mongoose";


const userSchema:Schema = new mongoose.Schema<IUser>({
  name:{
    type:String,
    required:true,
  },
  email:{
    type:String,
    required:true,
    unique:true,
    lowercase:true
  },
  password:{
    type:String,
    required:true,
  }
})

export const User = mongoose.model<IUser>('User',userSchema);