import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    conversationId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Conversation",
        required : [true, "Please add a conversationId"],
        index : true
    },

    role : {
        type : String, 
        enum : ["user", "assistant"],
        required : [true, "Please add a role"]
    },

    content : {
        type : String,
        required : [true, "Please add a content"]
    },

    triage : {
        type : mongoose.Schema.Types.Mixed,
        default : null
    }
},{timestamps : true});

export default mongoose.model("Message", messageSchema);