import express from 'express';
import { registerUser, loginUser, logout, verifyAuth, getUsers, updateProfile } from '../controllers/auth.js';
import { isAuthenticated } from '../authMiddleware.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadPath = path.join(process.cwd(), 'uploads')

// Create uploads folder if it doesn't exist
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const upload = multer({ storage })
  

const authrouter = express.Router();

authrouter.post('/signup', registerUser);
authrouter.post('/login', loginUser);
authrouter.post('/logout', logout);
authrouter.get('/verify', isAuthenticated, verifyAuth);
authrouter.get('/users', isAuthenticated, getUsers);
authrouter.put('/update', isAuthenticated, upload.single('profilePicture') ,updateProfile)


export default authrouter;