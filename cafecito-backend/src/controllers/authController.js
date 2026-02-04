import User from "../models/Users.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const generateToken = (id) =>{
    return jwt.sign({ id},process.env.JWT_SECRET,{
        expiresIn: '7d',
    });
};


export const register = async (req, res)=> {
    try{
        const { name, email, password,role } = req.body;

        const userExists = await User.findOne({email});
        if(userExists){
            return res.status(400).json({
                success: false,
                message: 'El usuario ya existe'
            });
        }
        const user = await User.create({ name, email, password,role });
        res.status(201).json({
            success: true,
            token: generateToken(user._id),
            user:{
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    }catch(error){
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};



export const login = async(req, res) => {
    try {
        const { email, password } = req.body;
        
        
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        
        res.json({
            success: true,
            token: generateToken(user._id),
            user: {
                _id: user._id,
                name: user.name,    
                email: user.email,  
                role: user.role     
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

