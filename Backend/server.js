import 'dotenv/config.js'
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cookieParser from 'cookie-parser';

import connectDB from './Config/db.js';
import corsMiddleware from './Config/cors.js';
import authRoutes from './routes/authRoutes.js'


const app = express()


const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL,
        credentials: true,
        methods: ["GET", "POST"]
    }
});

app.use(corsMiddleware)
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoutes)

app.get('/', (req, res)=>{
    res.status(200).json({
        message: "Welcome"
    })
})

const url = process.env.MONGO_URL;
const port = process.env.PORT || 5000;

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

const startServer = async() => {
    try {
        await connectDB(url)

        server.listen(port, ()=>{
            console.log(`Server is running at http://localhost:${port}`);
    
        });
    } catch (error) {
        console.error("Server startup failed", error.message);
        process.exit(1);
    }
}

startServer();