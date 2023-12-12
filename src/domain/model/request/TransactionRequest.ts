export type CreateTransactionRequest = {
    id: number;
    product_id: number[];
    qty: number[];
}

export type UpdateTransactionRequest = {
    order_id: number;
    product_id: number;
    qty: number;
}