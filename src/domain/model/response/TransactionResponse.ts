export type GetOrderItemByOrderIdResponse = {
    order_id: number;
    qty: number;
    product_id: number;
}

export type GetOrderByOrderIdResult = {
    order_id: number;
    qty: number;
    product_id: number;
}

export type GetTransactionDetailQueryResult = {
    id: number;
    user_id: number;
    payment_method: string;
    items_price: string;
    shipping_price: string;
    is_paid: number;
    paid_at: number | null;
    created_at: number;
    updated_at: number;
    product_id: number;
    qty: number;
}