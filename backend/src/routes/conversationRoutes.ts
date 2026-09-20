import express from "express";
import {authMiddleware} from "../middlewares/authMiddleware.js";
import {createConversation, getConversations, getConversation, deleteConversation, sendMessage} from "../controllers/conversationControllers.js"

export const router = express.Router();

router.post("/", authMiddleware, createConversation );
router.get("/", authMiddleware, getConversations);
router.get("/:conversationId", authMiddleware, getConversation);
router.delete("/:conversationId", authMiddleware, deleteConversation);
router.post("/:conversationId/messages", authMiddleware, sendMessage);
