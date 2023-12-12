export type CreateTransactionParams = {
    id: number;
    product_id: number;
    qty: number;
}

export type InsertOrderItemParams = {
    insertId: number;
    product_id: number | any;
    qty: number;
}

export type UpdateTransactionParams = {
    id: number;
    order_id: number;
    product_id: number;
    qty: number;
}

export type UpdateOrderParams = {
    order_id: number;
    product_id: number;
    qty: number;
}