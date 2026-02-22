export interface LoginData {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    role?: 'admin' | 'vendedor';
}

export interface AuthResponse {
    success: boolean;
    token: string;
    user: {
        _id: string;
        name: string;
        email: string;
        role: 'admin' | 'vendedor';
    };
}