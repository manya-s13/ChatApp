import express from 'express';  
import cors from 'cors';
import dotenv from 'dotenv';
import msgrouter from './routes/msgRouter.js';
import authrouter from './routes/authrouter.js';
import { connectDB } from './config/db.js';
import cookieParser from 'cookie-parser';
import {createServer} from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: true,
    credentials: true,
  }
});
app.use(express.json());

dotenv.config();

app.use(cors({
  origin: "http://localhost:5173", 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('sendMessage', (data) => {
    io.to(data.receiver).emit('newMessage', {
      sender: data.sender,
      content: data.content,
      timestamp: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

connectDB()                                 
  .then(() => {
    app.use('/api/auth', authrouter);
    app.use('/api/messages', msgrouter);
    

    const PORT = process.env.PORT || 3000;


    httpServer.listen(PORT, () => console.log(`Server on ${PORT}`));
  })
  .catch(err => console.error('DB failed to connect', err));

