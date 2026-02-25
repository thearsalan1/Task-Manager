import Jwt  from "jsonwebtoken";
import { env } from "../config/env"
import { JwtPayload } from "../Types/types";

export const signToken = (payload:JwtPayload) =>{
  return Jwt.sign(payload,env.jwtSecret,{
    expiresIn:'30m'
  });
};

export const verifyToken = (token:string):JwtPayload=>{
  return Jwt.verify(token,env.jwtSecret)as JwtPayload
}