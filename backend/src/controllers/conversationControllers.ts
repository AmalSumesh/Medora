import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import type { Request, Response } from "express";
import "dotenv/config";

export const createConversation = async (req: Request, res: Response) => {
    try {
        const { title } = req.body;
        const python_api_url = process.env.PYTHON_API_URL?.replace(/\/+$/, "");
        if (!python_api_url) throw new Error("PYTHON_API_URL is not defined.");

        const pythonResponse = await fetch(`${python_api_url}/session`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        if (!pythonResponse.ok) {
            throw new Error("Failed to create AI session");
        }

        const pythonData = await pythonResponse.json();

        const aiSessionId = pythonData.session_id;

        const conversation = await Conversation.create({
            userId: req.user!.id,
            title,
            aiSessionId
        });

        res.status(201).json({
            message: "Conversation created Successfully.",
            conversation
        });
    }
    catch (error) {
        console.error("CREATE CONVERSATION ERROR:", error);

        res.status(500).json({
            message: "Failed to create conversation"
        });
    }
};


export const getConversations = async (req: Request, res: Response) => {
    try {
        const conversations = await Conversation.find({
            userId: req.user!.id,
        }).sort({
            updatedAt: -1
        });

        res.status(201).json({
            message: "Conversations fetched Successfully",
            conversations
        });
    }
    catch (error) {
        console.error(`GET CONVERSATION ERROR : ${error}`)

        res.status(500).json({
            message: "Failed to fetch Conversations"
        });
    }
}


export const getConversation = async (req: Request, res: Response) => {
    try {
        const { conversationId } = req.params;

        const conversation = await Conversation.findOne({
            _id: conversationId,
            userId: req.user!.id
        });

        if (!conversation) {
            return res.status(404).json({
                message: "Conversation not found"
            });
        }

        const messages = await Message.find({
            conversationId: conversation._id
        }).sort({
            createdAt: 1
        });

        res.status(201).json({
            conversation,
            messages
        });

    }

    catch (error) {
        console.error("GET CONVERSATION ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch conversation"
        });
    }
}


export const deleteConversation = async (req: Request, res: Response) => {
    try {
        const { conversationId } = req.params;
        const conversation = await Conversation.findOneAndDelete({
            _id: conversationId,
            userId: req.user!.id
        });
        if (!conversation) {
            return res.status(404).json({
                message: "Conversation NOT found."
            });
        }

        await Message.deleteMany({
            conversationId: conversation._id,
        });

        res.status(200).json({
            message: "Conversation deleted successfully"
        });
    }
    catch (error) {
        console.error("DELETE CONVERSATION ERROR:", error);

        res.status(500).json({
            message: "Failed to delete conversation"
        });
    }
}


export const sendMessage = async (req: Request, res: Response) => {
    try {
        const { conversationId } = req.params;
        const { content } = req.body;

        const conversation = await Conversation.findOne({
            _id: conversationId,
            userId: req.user!.id
        });

        if (!conversation) {
            return res.status(404).json({
                message: "Conversation not found"
            });
        }

        const message = await Message.create({
            conversationId: conversation._id,
            role: "user",
            content
        });

        const python_api_url = process.env.PYTHON_API_URL?.replace(/\/+$/, "");
        if (!python_api_url) throw new Error("PYTHON_API_URL is not defined.");

        const pythonResponse = await fetch(`${python_api_url}/triage`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    session_id: conversation.aiSessionId,
                    message: content
                })
            }
        );

        if (!pythonResponse.ok) {
            const errorText = await pythonResponse.text().catch(() => "");
            console.error("AI SERVICE ERROR:", pythonResponse.status, errorText);
            throw new Error(`AI service responded with status ${pythonResponse.status}`);
        }

        const pythonData = await pythonResponse.json();

        const assistantResponse =
            pythonData.next_question ??
            pythonData.recommendation ??
            "I have noted your message. If you are experiencing serious or worsening symptoms, please seek prompt medical care.";

        const response = await Message.create({
            conversationId: conversation._id,
            role: "assistant",
            content: assistantResponse,
            triage: pythonData
        });

        res.status(201).json({
            message,
            response,
            triage: pythonData
        });

    }
    catch (error) {
        console.error("SEND MESSAGE ERROR:", error);

        res.status(500).json({
            message: "Failed to send message"
        });
    }

}