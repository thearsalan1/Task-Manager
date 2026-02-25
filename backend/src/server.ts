import express, { Request, Response } from 'express';
import cors from "cors"
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { connectDB } from './config/db';
import authRoutes from "./routes/auth.routes"

const app = express();

app.use(cors({
  origin:env.frontendUrl,
  credentials:true,
}));
app.use(express.json());
app.use(cookieParser());


// routes
app.use("/api/auth",authRoutes);
app.get("/health",(req:Request,res:Response)=>{
  res.status(200).json({message:"Server is running successfully"});
})

const PORT = env.port;

app.listen(PORT,async ()=>{
  connectDB();
  console.log(`Server is running at http://localhost:${PORT}`);
})