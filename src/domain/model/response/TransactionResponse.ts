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


export type TransactionDetailQueryResult = {
    user_id: number
    transaction_id: number
    name: string
    items_price: string
    shipping_price: string
    total_price: string
    product_bought: string
    qty: string
    is_paid: string
    paid_at: number
    transaction_status: string
    delivery_status: string
    created_at: number
    address: string
    postal_code: string
    city: string
    province: string
    country: string
}


type ProductBought = {
    product_name: string;
    qty: string;
}

type ShippingAddress = {
    address: string
    postal_code: string
    city: string
    province: string
    country: string
}

export type TransactionDetailResult = {
    user_id: number
    transaction_id: number
    name: string
    product_bought: ProductBought[] | ProductBought
    items_price: number
    shipping_price: number
    total_price: number
    is_paid: string
    paid_at: string
    transaction_status: string
    delivery_status: string
    shipping_address: ShippingAddress
    created_at: string
}

export type GetTransactionListByIdResponse = {
    id: number;
    user_id: number;
    payment_method: string;
    items_price: number;
    shipping_price: number;
    total_price: number;
    shipping_address_id: number;
    is_paid: number;
    paid_at: number;
    created_at: number;
    updated_at: number;
}

export type GetTransactionStatusResponse = {
    status: number;
}
