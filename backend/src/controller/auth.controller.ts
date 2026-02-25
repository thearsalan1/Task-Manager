import { CookieOptions, NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { User } from "../models/User.model";
import bcrypt from "bcryptjs";
import { signToken, verifyToken } from "../utils/jwt";

const COOKIE_OPTIONS:CookieOptions = {
  httpOnly:true,
  secure:env.nodeEnv === 'production',
  sameSite:env.nodeEnv === 'production' ? 'none' : 'lax' as const,
  maxAge:30*60*1000,
};

export const register = async (req:Request,res:Response,next:NextFunction)=>{
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  try {
    const {name,email,password} = req.body;
    if(!name || !email || !password) {
      return res.status(400).json({message:"All fields are required"});
    }
    if(password.length<6){
      return res.status(400).json({message:"Password must me atleast 6 character long"});
    }
    if(!emailRegex.test(email)){
      return res.status(401).json({message:"Invalid email formate"});
    }

    const isExisting = await User.findOne({email});
    if(isExisting){
      return res.status(400).json({message:"Email already registered"});
    }

    const hash = await bcrypt.hash(env.jwtSecret,10)

    const user = await User.create({
      name,
      email,
      password:hash
    });
    
    await user.save();

    res.status(201).json({
      message:"User registered successfully",
      user:{id:user._id,name:user.name,email:user.email},
    })
  } catch (error) {
    next(error);
  }
}

export const login = async(req:Request,res:Response,next:NextFunction)=>{
  try {
    const {email,password}= req.body;

    if(!email || !password){
      return res.status(400).json({message:"All fields required"});
    }

    const user = await User.findOne({email});
    if(!user){
      return res.status(400).json({message:"User not found"});
    }

    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
      return res.status(400).json({message:"Invalid credentials"});
    }

    const token = signToken({userId:user._id.toString()});
    res.cookie('access_token',token,COOKIE_OPTIONS);

    return res.json({
      message:'Login successful',
      user:{ id: user._id, name: user.name, email: user.email }
    })
  } catch (error) {
    next(error);
  }
}


export const logout = async (_req:Request,res:Response)=>{
  res.clearCookie('access_token',{
    httpOnly: true,
    secure: env.nodeEnv === 'production', sameSite: env.nodeEnv === 'production' ? 'none' : 'lax' 
  });
  return res.json({ message: 'Logged out' 
  })
}

export const me = async (req: Request, res: Response,next:NextFunction) => {
  const token = req.cookies?.access_token;

  if (!token) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const payload = verifyToken(token);

    const user = await User.findById(payload.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    next(error)
  }
};