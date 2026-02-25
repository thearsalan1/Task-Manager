import { ITask } from './../Types/types';
import mongoose, { Schema } from "mongoose";


const taskSchema:Schema = new mongoose.Schema<ITask>({
  title:{
    type:String,
    required:true
  },
  description:{
    type:String,
    required:true,
  },
  status:{
    type:String,
    required:true,
    enum:['todo' , 'in-progress' , 'done'],
    default:'todo'
  },
  userId:{
    type:mongoose.Types.ObjectId,
    ref:'User',
    required:true,
  }
},{timestamps:true})

taskSchema.index({userId:1,createdAt:-1});


export const Task = mongoose.model<ITask>('Task',taskSchema);