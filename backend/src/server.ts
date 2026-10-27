import express from "express";
import "dotenv/config";
import cors from "cors";


import {connectToDb} from "./config/database.js";
import {router as authRoutes} from "./routes/authRoutes.js";
import {router as conversationRotes} from "./routes/conversationRoutes.js";

const app = express();

process.on("uncaughtException", (err)=>{
    console.error("UNCAUGHT EXCEPTION:", err);
    process.exit(1);
});

process.on("unhandledRejection", (err)=>{
    console.error("UNCAUGHT EXCEPTION:", err);
    process.exit(1);
});

connectToDb();

app.use(cors());
app.use(express.json());

app.get("/", (req, res)=>{
    res.send("API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/conversations", conversationRotes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log(`Server is listening on port ${PORT}`);    
});