import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import type {Request, Response} from "express";

export const createConversation  = async(req : Request, res: Response)=>{
    try{
        const {title} = req.body;
        const conversation = await Conversation.create({
            userId: req.user!.id,
            title
        });

        res.status(201).json({
            message : "Conversation created Successfully.",
            conversation
        });
    }
    catch(error){
        console.error("CREATE CONVERSATION ERROR:", error);

        res.status(500).json({
            message: "Failed to create conversation"
        });
    }
};


export const getConversations = async(req : Request, res: Response)=>{
    try{
        const conversations = await Conversation.find({
            userId : req.user!.id,
        }).sort({
            updatedAt : -1
        });

        res.status(201).json({
            message : "Conversations fetched Successfully",
            conversations
        });
    }
    catch(error){
        console.error(`GET CONVERSATION ERROR : ${error}`)
       
        res.status(500).json({
            message : "Failed to fetch Conversations"
        });
    }
}


export const getConversation = async(req: Request, res: Response)=>{
    try{
        const {conversationId}  = req.params;

        const conversation = await Conversation.findOne({
            _id :conversationId,
            userId : req.user!.id
        });

        if(!conversation){
            return res.status(404).json({
                message: "Conversation not found"
            });
        }

        const messages = await Message.find({
            connversationId : conversation._id
        }).sort({
            createdAt: 1
        });

        res.status(201).json({
            conversation, 
            messages
        });

    }

    catch(error){
        console.error("GET CONVERSATION ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch conversation"
        });
    }
}


export const deleteConversation = async (req : Request, res : Response)=>{
    try{
        const {conversationId} = req.params;
        const conversation = await Conversation.findOneAndDelete({
            _id : conversationId,
            userId : req.user!.id
        });
        if(!conversation){
            return res.status(404).json({
                message : "Conversation NOT found."
            });
        }

        await Message.deleteMany({
            connversationId : conversation._id,
        });

        res.status(200).json({
            message: "Conversation deleted successfully"
        });
    }
    catch(error){
        console.error("DELETE CONVERSATION ERROR:", error);

        res.status(500).json({
            message: "Failed to delete conversation"
        });        
    }
}


export const sendMessage = async (req : Request, res : Response)=>{
    try{
        const {conversationId} = req.params;
        const {content} = req.body;
        
        const conversation = await Conversation.findOne({
            _id : conversationId,
            userId : req.user!.id
        });

        if (!conversation){
            return res.status(404).json({
                message: "Conversation not found"
            });            
        }

        const message = await Message.create({
            connversationId : conversation._id,
            role : "user",
            content
        });

        res.status(201).json({
            message
        });

    }
    catch(error){
        console.error("SEND MESSAGE ERROR:", error);

        res.status(500).json({
            message: "Failed to send message"
        });
    }

}