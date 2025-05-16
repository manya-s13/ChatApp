import express from 'express';
import { sendMessage, getMessages } from '../controllers/msg.js';
import { isAuthenticated } from '../authMiddleware.js';
const msgrouter = express.Router();

msgrouter.post('/send', isAuthenticated, sendMessage);
msgrouter.get('/:user1/:user2', isAuthenticated, getMessages);

export default msgrouter;