import Joi from "joi"

export const ShippingAddressId = Joi.number().min(1).required().messages({
    "number.base": "id must be a number",
    "number.min": "id must be greater than or equal to 1",
    "any.required": "id is a required field",
})

export const CreateShippingAddress = Joi.object({
    user_id: Joi.number().required().messages({
        "any.required": "user_id is required",
    }),
    address: Joi.string().required().messages({
        "any.required": "address is required",
        "string.base": "address must be a string",
    }),
    city: Joi.string().required().messages({
        "any.required": "city is required",
        "string.base": "city must be a string",
    }),
    province: Joi.string().required().messages({
        "any.required": "Province is required",
        "string.base": "Province must be a string",
    }),
    postal_code: Joi.string().alphanum().required().messages({
        "any.required": "postal_code is required",
        "string.base": "postal_code must be a string",
    }),
    country: Joi.string().required().messages({
        "any.required": "country is required",
        "string.base": "country must be a string",
    }),
})

export const UpdateShippingAddress = Joi.object({
    id: ShippingAddressId,
    user_id: Joi.number().required().messages({
        "any.required": "user_id is required",
    }),
    address: Joi.string().messages({
        "string.base": "address must be a string",
    }),
    city: Joi.string().messages({
        "string.base": "city must be a string",
    }),
    province: Joi.string().messages({
        "string.base": "Province must be a string",
    }),
    postal_code: Joi.string().messages({
        "string.base": "postal_code must be a string",
    }),
    country: Joi.string().messages({
        "string.base": "country must be a string",
    }),
})

export const GetUserShippingAddressById = Joi.object({
    user_id: Joi.number().required().messages({
        "any.required": "user_id is required",
    }),
})
