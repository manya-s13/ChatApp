import jwt from 'jsonwebtoken';
import User from '../models/users.js';
import  {isAuthenticated} from '../authMiddleware.js'

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
            email: req.user.email
          }
     });
  };

export const getUsers = async (req, res) => {
    try {
      const users = await User.find({ _id: { $ne: req.user._id } }).select('name');
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users!!" });
    }
};

export const updateProfile = async (req, res) => {
    const { name, email, password } = req.body;
    const userId = req.user._id;

    if (!name || !email) {
        return res.status(400).json({ message: "Name and email are required" });
    }

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, email, password },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Profile update failed", error: error.message });
    }
};
  