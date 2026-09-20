import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : [true, "Please add a userId"]
    },

    title : {
        type : String,
        required : [true, "Please add a title"]
    },

    aiSessionId: {
        type: String,
        required: [true, "Please add an aiSessionId"]
    }
    
},{timestamps : true});

export default mongoose.model("Conversation", conversationSchema);