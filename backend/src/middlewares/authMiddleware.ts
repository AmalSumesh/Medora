import jwt from "jsonwebtoken";
import "dotenv/config";
import type { Request, Response, NextFunction } from "express";


export const authMiddleware = (
    req : Request, 
    res : Response, 
    next : NextFunction
)=>{
    const authHeader = req.headers.authorization;
    
    if(!authHeader){
        return res.status(401).json({
            message:"No token Provided"
        })
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
    return res.status(401).json({
        message: "Invalid authorization header"
    });
}

    try{
        const jwtsecret = process.env.JWT_SECRET;
        if(!jwtsecret) throw new Error("JWT_SECRET is not defined.")
       
        const decoded = jwt.verify(token, jwtsecret );
        req.user = decoded;
        next()
    }
    catch(error){
        return res.status(404).json({
            message : "Internal Server Error"
        })
    }
}

