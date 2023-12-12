export type CreateTransactionRequest = {
    id: number;
    product_id: number;
    qty: number;
}

export type UpdateTransactionRequest = {
    id: number;
    order_id: number;
    product_id: number;
    qty: number;
}