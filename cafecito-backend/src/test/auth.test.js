import request from 'supertest';
import app from '../../server.js'; // Asegúrate de exportar 'app' en server.js (export default app)
import mongoose from 'mongoose';

describe('Verificación de Seguridad (Auth Middleware)', () => {
    it('Debería denegar el acceso (401) si no se envía un token', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({
                name: "Intruso",
                email: "hacker@test.com",
                password: "password123"
            });
        
        expect(response.statusCode).toBe(401);
        expect(response.body.message).toBe('Acceso denegado, no hay token');
    });

    afterAll(async () => {
        // Cierra la conexión a la base de datos si es necesario
        await mongoose.connection.close();
    });


});

