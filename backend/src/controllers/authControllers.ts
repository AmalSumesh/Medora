import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import type {Request, Response} from "express";

export const register = async(req : Request, res: Response)=>{
    try{
        const {name, email, password} = req.body;
        const userExists = await User.findOne({email : email});
        if (userExists){
            return res.status(401).json({
                message : "User already exists."
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password : hashedPassword
        });

        res.status(201).json({
            message : "User Registered Successfully",
            user
        });
    }
    catch(error){
        res.status(400).json({
            message : "Internal Server Error"
        })
    }
}


export const login = async(req : Request, res : Response)=>{
    try{
        const{email, password} = req.body;
        const user = await User.findOne({email}).select("+password");

        if (!user){
            return res.status(400).json({
                message : "User not found."
            })
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(400).json({
                message : "Invalid Password"
            })
        }

        const jwtsecret = process.env.JWT_SECRET;
        if(!jwtsecret) throw new Error("JWT_SECRET is not defined.")
        const token = jwt.sign(
            {id : user._id},
            jwtsecret,
            {expiresIn : '1d'}
        );

        const {password:_, ...userData} = user.toObject();
        res.status(201).json({
            message : "Login Successful",
            user : userData,
            token
        });
    }

    catch(error){
        res.status(400).json({
            message : "Internal Server Error"
        });
    }

}
