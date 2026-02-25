import { NextFunction, Request, Response } from "express";


export const errorHandler = (
  err:any,
  _req:Request,
  res:Response,
  _next:NextFunction
) => {
  console.log(err);
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  return res.status(status).json({message})
}