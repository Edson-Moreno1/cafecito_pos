export type role = 'admin' | 'cajero';

// Entidad Usuario definida en la BD
export interface User {
    _id: string;
    name: string;
    email: string;
    role: role;
    createdAt?: Date;
    updatedAt?: Date;
}

// Lo que devuelve el backend al autenticar
export interface AuthResponse {
    success: boolean;  
    token: string;
    user: User;
    message?: string;  
}

// Lo que envías para loguearte
export interface LoginData {
    email: string;
    password: string;
}

// Lo que envías para registrarte
export interface RegisterData {
    name: string;
    email: string;
    password: string;
    role: role;
}