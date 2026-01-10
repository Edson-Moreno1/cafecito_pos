//Importaciones
import express from "express";
import 'dotenv/config';
import dbConnection  from "./src/config/database.js";

const app= express();

//Conectar a la base de datos 
dbConnection();

// Middlewares
app.use(express.json());

//Rutas
app.get('/api', (req, res) => {
    res.json({ message: '¡Hola desde la API!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});