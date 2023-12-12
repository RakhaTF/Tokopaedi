export type CreateTransactionParams = {
    id: number;
    product_id: number[];
    qty: number[];
    created_at: number;
    updated_at: number;
}

export type CreateTransactionIdParams = {
    id: number;
    items_price: number;
    created_at: number;
    updated_at: number;
}

export type InsertOrderItemParams = {
    insertId: number;
    product_id: number[];
    qty: number[];
}

export type InsertOrderItemRepositoryParams = string // contoh `(5, 1, 1)` (transaction_id, product_id, qty)

export type UpdateTransactionParams = {
    id: number;
    order_id: number;
    product_id: number;
    qty: number;
    updated_at: number;
}

export type UpdateOrderParams = {
    order_id: number;
    product_id: number;
    qty: number;
}

export type UpdateTransactionProductQty = {
    order_id: number;
    items_price: number;
    updated_at: number;
}

//Allowed payment method.
type PaymentMethod = "Cash" | "Credit Card" | "Debit Card"

export type PayTransactionParams = {
    payment_method: PaymentMethod;
    is_paid: 0 | 1;
    paid_at: number;
    shipping_price: number;
    total_price: number;
    updated_at: number;
    user_id: number;
}