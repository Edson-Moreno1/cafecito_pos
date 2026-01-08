//Importaciones
import mongoose from "mongoose";
import express from "express";
import dotenv from 'dotenv';

dotenv.config();



const app = express();
const PORT = process.env.PORT || 3001;


//Conexión MongoDB
import dbConnection from "./src/config/database.js";
dbConnection();

app.use(express.json());

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});