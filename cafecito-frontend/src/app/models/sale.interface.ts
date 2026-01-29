export type PaymentMethod = 'cash' | 'card' | 'transfer';

export interface SaleItem{
    product: string;
    quantity: number;
    unitPrice?: number;
    amount?: number;
}

export interface Sale {
    _id?: string;
    saleId?: string;
    customerId?: string;
    paymentMethod: PaymentMethod;
    items: SaleItem[];

    subtotal: number;
    discountPercent?: number;
    discountAmount?: number;
    total: number;
    createdAt?: Date;
    updatedAt?: Date;
}