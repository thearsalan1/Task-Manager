import express, { Request, Response } from 'express';
import cors from "cors"
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { connectDB } from './config/db';
import authRoutes from "./routes/auth.routes"
import taskRoutes from "./routes/task.routes"

const app = express();

app.use(cors({
  origin: env.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(cookieParser());


// routes
app.use("/api/auth",authRoutes);
app.use("/api/task",taskRoutes)
app.get("/health",(req:Request,res:Response)=>{
  res.status(200).json({message:"Server is running successfully"});
})

const PORT = env.port;

app.listen(PORT,async ()=>{
  connectDB();
  console.log(`Server is running at http://localhost:${PORT}`);
})