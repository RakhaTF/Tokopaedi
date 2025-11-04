import { UpdateDeliveryStatusRequest, UpdateTransactionStatusRequest } from "../request/TransactionRequest"
import { PaymentMethod } from "../types/TransactionTypes";

export type CreateTransactionParams = {
    id: number
    product_id: number[]
    qty: number[]
    created_at: number
    updated_at: number
}

export type CreateTransactionIdParams = {
    id: number
    items_price: number
    created_at: number
    updated_at: number
    expire_at: number
}

export type InsertOrderItemParams = {
    insertId: number
    product_id: number[]
    qty: number[]
}

export type UpdateTransactionProductQtyParams = {
    id: number
    order_id: number
    product_id: number
    qty: number
    updated_at: number
}

export type UpdateOrderParams = {
    order_id: number
    product_id: number
    qty: number
}

export type UpdateTransactionProductQty = {
    order_id: number
    items_price: number
    updated_at: number
}

export type PayTransactionRepositoryParams = {
    transaction_id: number
    user_id: number
    payment_method: PaymentMethod
    is_paid: number // 0 = pending, 1 = paid
    paid_at: number
    shipping_address_id: number
    shipping_price: number
    updated_at: number
}

export type CreateDeliveryStatusParams = {
    transaction_id: number
    expedition_name: string
    status: number
    is_delivered: number
    delivered_at: number
    updated_at: number
}

export type GetUserTransactionListByIdParams = {
    user_id: number
}

export type UpdateDeliveryStatusParams = UpdateDeliveryStatusRequest & {
    updated_at: number
}

export type UpdateTransactionStatusParams = UpdateTransactionStatusRequest & {
    status: number
    updated_at: number
}