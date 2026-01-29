export type role = 'admin' | 'cajero';


//Entidad Usario esta definida en el BD
export interface User {
    _id: string;
    name: string;
    email: string;
    role: role;
    createdAt?: Date;
    updatedAt?: Date;
}
//Loque devuelve el backend al autenticar
export interface AuthResponse {
    user: User;
    token: string;
}

// Lo que envias para logearte
export interface LoginData {
    email: string;
    password: string;
}

// Lo que envias para registrarte
export interface RegisterData {
    name: string;
    email: string;
    password: string;
    role: role;
}