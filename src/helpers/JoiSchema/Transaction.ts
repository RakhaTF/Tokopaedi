import Joi from "joi";

export const CreateTransaction = Joi.object({
    id: Joi.number().required().messages({
        'any.required': 'Id is required',
    }),
    product_id: Joi.number().required().messages({
        'any.required': 'Order_id is required',
    }),
    qty: Joi.number().required().messages({
        'any.required': 'Order_id is required',
    }),
}).options({ abortEarly: false });