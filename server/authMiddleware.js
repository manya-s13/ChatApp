import User from "./models/users.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = async (req, res, next) => {
    try{
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

        if(!token){
            return res.status(401).json({message: "not authenticated"});
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);
        if(!user){
            return res.status(401).json({message: "unauthorized user"});
        }
        req.user = user;
        next();

    } catch(error){
        if(error.name === 'TokenExpiredError'){
            return res.status(401).json({message: "session expired, please login again"});
        }
        return res.status(500).json({message: error.message});
    }
}