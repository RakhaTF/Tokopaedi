import { PaymentMethod } from "../params/TransactionParams";

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

export type PayTransactionRequest = {
    transaction_id: number;
    user_id: number;
    payment_method: PaymentMethod;
    shipping_address_id: number;
    expedition_name: string;
}

export type GetUserTransactionListByIdRequest = {
    userid: number;
}

export type UpdateDeliveryStatusRequest = {
    transaction_id: number;
    status: number;
    is_delivered: number;
}

export type UpdateTransactionStatusRequest = {
    transaction_id: number;
}