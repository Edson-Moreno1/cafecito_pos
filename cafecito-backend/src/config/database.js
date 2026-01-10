import mongoose from "mongoose";
import 'dotenv/config';

const dbConnection = async () => {
    try {
        const dbURI = process.env.MONGODB_URI;
        if (!dbURI) {
            throw new Error('La variable de entorno MONGODB_URI no está definida.Revisa tu achivo .env');
        }
        const conn = await mongoose.connect(dbURI);
        console.log(`MongoDB conectado: ${conn.connection.host}`);
    }catch (error) {
        console.error('Error conectando a MongoDB:', error.message);
        process.exit(1);
    }

};

export default dbConnection;