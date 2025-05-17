import jwt from 'jsonwebtoken';
import User from '../models/users.js';
import  {isAuthenticated} from '../authMiddleware.js'
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Please fill all fields" });
    }

    const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({
                status: "failed",
                data: [],
                message: "It seems you already have an account, please log in instead.",
            });

    const newUser = new User({
        name,
        email,
        password
    });
    try{
        await newUser.save();
        res.status(201).json({
          message: "Signup successful",
          user: {
            _id: newUser._id,
            email: newUser.email,
          },
        });
    } catch(error){
        es.status(500).json({ message: "Registration failed", error: error.message });
    }
}

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Please provide both email and password" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

       const isMatch = await user.matchPassword(password);
       if(!isMatch){
            return res.status(401).json({ message: "Invalid credentials" });
        }

        await user.save();

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET, 
            { expiresIn: '1h' } 
        );

        res
        .cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/'
        })
        .status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};

export const logout = async(req, res) =>{
    try{
        res.clearCookie('token', {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path:'/'
        })
    
       res.status(200).json({
            message: "Logout successful",
            isAuthenticated : false
        })
    }
    catch(error){
        res.status(500).json({
            message: "Something went wrong",
            error: error.message
        })
    }
}

export const verifyAuth = async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.status(200).json({ message: "Authenticated", 
        user: {
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            profilePicture: req.user.profilePicture || ''
          }
     });
  };

export const getUsers = async (req, res) => {
    try {
      const users = await User.find({ _id: { $ne: req.user._id } }).select('name profilePicture');
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users!!" });
    }
};

// export const updateProfile = async (req, res) => {
//   try {
//     const { profilePic } = req.body;
//     const userId = req.user._id;

//     if (!profilePic) {
//       return res.status(400).json({ message: "Profile pic is required" });
//     }

//     const uploadResponse = await cloudinary.uploader.upload(profilePic);
//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { profilePic: uploadResponse.secure_url },
//       { new: true }
//     );

//     res.status(200).json(updatedUser);
//   } catch (error) {
//     console.log("error in update profile:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

export const updateProfile = async (req, res) => {
    const { name, email, password } = req.body;
    const userId = req.user._id;
    let profilePicture;
  
    // Validate presence of update fields
    if (!name && !email && !password && !req.file) {
      return res.status(400).json({ message: "At least one field is required for update" });
    }
  
    // Validate email format if provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
    }
  
    // Handle profile image upload to Cloudinary
    if (req.file) {
      try {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'chat_app_profiles',
          width: 150,
          crop: "scale"
        });
        profilePicture = result.secure_url;
  
        // Optional: Delete local file after upload
        fs.unlinkSync(req.file.path);
      } catch (error) {
        return res.status(500).json({ message: "Failed to upload image", error: error.message });
      }
    }
  
    try {
      const updateData = {
        ...(name && { name }),
        ...(email && { email }),
        ...(password && { password }),
        ...(profilePicture && { profilePicture })
      };
  
      const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
  
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.status(200).json({
        message: "Profile updated successfully",
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          profilePicture: updatedUser.profilePicture
        }
      });
    } catch (error) {
      console.error('Update error:', error);
      res.status(500).json({ message: "Profile update failed", error: error.message });
    }
};
  