//Importaciones
import express from "express";
import 'dotenv/config';
import dbConnection  from "./src/config/database.js";

//prueba de servicio salecontroller
import saleRoutes from "./src/routes/saleRoutes.js";

const app= express();

//Conectar a la base de datos 
dbConnection();

// Middlewares
app.use(express.json());

//Rutas
app.get('/api', (req, res) => {
    res.json({ message: '¡Hola desde la API!' });
});

//ruta venta de prueba
app.use('/api/sale', saleRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});