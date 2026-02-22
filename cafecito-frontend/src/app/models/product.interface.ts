  export interface Product {
    _id?: string;
    name: string;
    price: number;
    stock: number;
    description?: string;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
 }