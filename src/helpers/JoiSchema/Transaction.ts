import Joi from "joi"
import { UserId } from "./User"

export const TransactionId = Joi.number().min(1).required().messages({
    "number.base": "transaction_id must be a number",
    "number.min": "transaction_id must be greater than or equal to 1",
    "any.required": "transaction_id is a required field",
})

const ProductId = Joi.number().min(1).required().messages({
    "number.base": "product_id must be a number",
    "number.min": "product_id must be greater than or equal to 1",
    "any.required": "product_id is a required field",
})

const Qty = Joi.number().min(1).required().messages({
    "number.base": "qty must be a number",
    "number.min": "qty must be greater than or equal to 1",
    "any.required": "qty is a required field",
})

const UpdatedAt = Joi.number().required().messages({
    "any.required": "Updated_at is required",
})

export const CreateTransaction = Joi.object({
    id: UserId.required().messages({
        "any.required": "User Id is required",
    }),
    product_id: Joi.array().items(Joi.number()).unique().required().messages({
        "any.required": "Product_id is required",
        "array.base": "Product_id must be an array",
        "array.empty": "Product_id cannot be an empty array",
        "number.base": "Each item in product_id must be a number",
    }),
    qty: Joi.array().required().items(Joi.number().min(1)).messages({
        "any.required": "Quantity is required",
        "array.base": "Quantity must be an array",
        "array.empty": "Quantity cannot be an empty array",
        "number.base": "Each item in quantity must be a number",
        "number.min": "Each item in quantity must be at least 1",
    }),
    created_at: Joi.number().required().messages({
        "any.required": "Created_at is required",
    }),
    updated_at: Joi.number().required().messages({
        "any.required": "Updated_at is required",
    }),
}).options({ abortEarly: false })

export const UpdateTransactionService = Joi.object({
    id: UserId.required().messages({
        "any.required": "Id is required",
    }),
    order_id: TransactionId,
    product_id: ProductId,
    qty: Qty,
    updated_at: UpdatedAt,
}).options({ abortEarly: false })

export const PayTransaction = Joi.object({
    transaction_id: TransactionId,
    payment_method: Joi.string().valid("Cash", "Credit Card", "Debit Card").required().messages({
        "string.base": "Payment method must be a string",
        "any.required": "Payment method is required",
        "any.only": "Payment method must be one of [Cash, Credit Card, Debit Card]",
    }),
    shipping_address_id: Joi.number().required().messages({
        "number.base": "Shipping address ID must be a number",
        "any.required": "Shipping address ID is required",
    }),
    user_id: UserId.required().messages({
        "any.required": "user_id is required",
    }),
    expedition_name: Joi.string().valid("JNE", "J&T", "Tiki", "Wahana", "Gojek", "Lion Parcel", "Ninja Express", "Shopee Express").required().messages({
        "string.base": "Expedition name must be a string",
        "any.required": "Expedition name is required",
        "any.only": "Expedition name must be one of [JNE, J&T, Tiki, Wahana, Gojek, Lion Parcel, Ninja Express, Shopee Express]",
    }),
}).options({ abortEarly: false })

export const UpdateDeliveryStatus = Joi.object({
    transaction_id: TransactionId,
    status: Joi.number().valid(0, 1, 2, 3).required().messages({
        "number.base": "Status must be a number",
        "any.only": "Status must be one of [0, 1 , 2, 3]",
    }),
    is_delivered: Joi.number().valid(0, 1).required().messages({
        "number.base": "is_delivered must be a number",
        "any.only": "is_delivered must be one of [0, 1]",
    }),
}).options({ abortEarly: false })

export const UpdateTransactionStatus = Joi.object({
    transaction_id: TransactionId,
}).options({ abortEarly: false })
