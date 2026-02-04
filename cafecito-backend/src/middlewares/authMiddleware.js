import jwt from "jsonwebtoken";
import User from "../models/Users.js";

export const verifyToken = async (req, res, next) => {
    let token;
    
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try{
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        }catch(error){
            return res.status(401).json({  
                success: false,
                message: 'Token no válido o expirado'
            });
        }
    } else {
        // 👆 Cambié "if(!token)" por "else" para evitar doble ejecución
        return res.status(401).json({
            success: false,
            message: 'Acceso denegado, no hay token'
        });
    }
};

export const isAdmin = (req, res, next) => {
    if(req.user && req.user.role === 'admin'){
        next();
    }else{
        res.status(403).json({
            success: false,
            message: 'Acceso denegado: Requiere rol de administrador'
        });
    }
};