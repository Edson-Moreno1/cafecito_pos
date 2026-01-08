import mongoose from "mongoose";
import 'dotenv/config';

const dbConnection = async () => {
    try {
        const dbURI = process.env.MONGODB_URI;
        if (!dbURI) {
            throw new Error('La variable de entorno MONGODB_URI no está definida.Revisa tu achivo .env');
        }
        await mongoose.connect(dbURI);
        console.log('Conexión a MongoDBAtlas establecida al 100%');
    }catch (error) {
        console.error('Error conectando a MongoDB:', error.message);
        process.exit(1);
    }

};

export default dbConnection;