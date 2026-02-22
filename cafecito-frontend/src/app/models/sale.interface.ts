import { Product } from "./product.interface";

// ========================
// Lo que ENVÍAS al backend
// ========================
export type PaymentMethod = 'cash' | 'card' | 'transfer';

export interface SaleItemRequest {
    product: string;         // productId como string
    quantity: number;
}

export interface SaleRequest {
    customerId?: string | null; // Puede ser null para ventas sin cliente
    items: SaleItemRequest[];
    paymentMethod: PaymentMethod;
}

// ========================
// Lo que RECIBES del backend
// ========================


export interface SaleItemDetail {
    productId: string;
    productNameSnapshot: string;
    unitPriceSnapshot: number;
    quantity: number;
    lineTotal: number;
}

export interface Sale {
    _id?: string;
    saleId: string;
    customerId?: string | null;
    paymentMethod: PaymentMethod;
    items: SaleItemDetail[];
    subtotal: number;
    discountPercent?: number;
    discountAmount?: number;
    total: number;
    createdAt?: Date;
    updatedAt?: Date;
}

// ========================
// Ticket
// ========================
 export interface TicketItem{
    name: string;
    qty: number;
    unitPrice: number;
    lineTotal: number;
 }

 export interface Ticket{
    saleId: string;
    timestamp: string;
    storeName: string;
    customerName: string | null;
    items: TicketItem[];
    subtotal: number;
    discount: string
    total: number;
    paymentMethod: PaymentMethod;
    loyaltyMessage: string;
 }
 export interface SaleResponse{
    message: string;
    sale: Sale;
    ticket: Ticket;
 }
// ========================
// Carrito (frontend only)
// ========================
export interface CartItem {
    product: Product;
    quantity: number;
}