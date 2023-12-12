export type CreateTransactionParams = {
    id: number;
    product_id: number[];
    qty: number[];
    created_at: number;
    updated_at: number;
}

export type CreateTransactionIdParams = {
    id: number;
    created_at: number;
    updated_at: number;
}

export type InsertOrderItemParams = {
    insertId: number;
    product_id: number[];
    qty: number[];
}

export type UpdateTransactionParams = {
    id: number;
    order_id: number;
    product_id: number[];
    qty: number[];
    updated_at: number;
}

export type UpdateOrderParams = {
    order_id: number;
    product_id: number[];
    qty: number[];
}

export type UpdateUpdatedAtTransactionParams = {
    order_id: number;
    updated_at: number;
}