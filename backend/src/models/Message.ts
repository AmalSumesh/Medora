import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    connversationId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Conversation",
        required : [true, "Please add a conversationId"]
    },

    role : {
        type : String, 
        enum : ["user", "assistant"],
        required : [true, "Please add a role"]
    },

    content : {
        type : String,
        required : [true, "Please add a content"]
    }
},{timestamps : true});

export default mongoose.model("Message", messageSchema);