//Importaciones
import express from "express";
import 'dotenv/config';
import dbConnection  from "./src/config/database.js";
import customerRoutes from "./src/routes/customerRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import saleRoutes from "./src/routes/saleRoutes.js";
import cors from "cors";
import authRoutes from "./src/routes/authRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
const app= express();

//Conectar a la base de datos 
dbConnection();

// Middlewares
app.use(express.json());
app.use(cors());

//Rutas
app.get('/api', (req, res) => {
    res.json({ message: '¡Hola desde la API!' });
});


//Montaje de rutas
app.use('/api/auth', authRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
}


export default app;