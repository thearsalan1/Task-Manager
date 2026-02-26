import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  name:string,
  email:string,
  password:string,
}

export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface ITask extends Document{
  title:string,
  description:string;
  status:TaskStatus;
  userId:mongoose.Types.ObjectId;
  createdAt:Date
}

export interface JwtPayload{
  userId:string;
}

