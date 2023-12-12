import Joi from "joi";

export const CreateTransaction = Joi.object({
    id: Joi.number().required().messages({
        'any.required': 'Id is required',
    }),
    product_id: Joi.array().items(Joi.number()).unique().required().messages({
        'any.required': 'Order_id is required',
    }),
    qty: Joi.array().required().items(Joi.number()).messages({
        'any.required': 'Order_id is required',
    }),
    created_at: Joi.number().required().messages({
        'any.required': 'Created_at is required',
    }),
    updated_at: Joi.number().required().messages({
        'any.required': 'Updated_at is required',
    }),
}).options({ abortEarly: false });

export const UpdateTransactionService = Joi.object({
    id: Joi.number().required().messages({
        'any.required': 'Id is required',
    }),
    order_id: Joi.number().required().messages({
        'any.required': 'Order_id is required',
    }),
    product_id: Joi.number().required().messages({
        'any.required': 'Order_id is required',
    }),
    qty: Joi.number().required().messages({
        'any.required': 'Order_id is required',
    }),
    updated_at: Joi.number().required().messages({
        'any.required': 'Updated_at is required',
    }),
}).options({ abortEarly: false });