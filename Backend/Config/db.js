import mongoose from "mongoose";

const connectDB = async (url) => {
    try {
        await mongoose.connect(url)
        console.log("MongoDB Connected");
        
    } catch (error) {
        console.error("MongoDB Connection Failed",error.message);
        
    }
}

export default connectDB