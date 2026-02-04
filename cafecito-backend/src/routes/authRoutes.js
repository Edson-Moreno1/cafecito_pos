import express from "express";
import { register,login,resetAdminPassword } from "../controllers/authController.js";
import { isAdmin, verifyToken } from "../middlewares/authMiddleware.js";


const router = express.Router();

router.post('/register',verifyToken,isAdmin, register);
router.post('/login', login);



export default router;