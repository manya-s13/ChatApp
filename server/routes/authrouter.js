import express from 'express';
import { registerUser, loginUser, logout, verifyAuth, getUsers } from '../controllers/auth.js';
import { isAuthenticated } from '../authMiddleware.js';

const authrouter = express.Router();

authrouter.post('/signup', registerUser);
authrouter.post('/login', loginUser);
authrouter.post('/logout', logout);
authrouter.get('/verify', isAuthenticated, verifyAuth);
authrouter.get('/users', isAuthenticated, getUsers);


export default authrouter;