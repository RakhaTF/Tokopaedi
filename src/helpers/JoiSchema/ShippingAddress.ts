import Joi from "joi"

export const ShippingAddressId = Joi.number().min(1).required().messages({
    'number.base': 'id must be a number',
    'number.min': 'id must be greater than or equal to 1',
    'any.required': 'id is a required field',
});

export const CreateShippingAddress = Joi.object({
    user_id: Joi.number().required().messages({
        'any.required': 'user_id is required',
    }),
    address: Joi.string().required().messages({
        'any.required': 'address is required',
    }),
    city: Joi.string().required().messages({
        'any.required': 'city is required',
    }),
    province: Joi.string().required().messages({
        'any.required': 'Province is required',
    }),
    postal_code: Joi.string().required().messages({
        'any.required': 'postal_code is required',
    }),
    country: Joi.string().required().messages({
        'any.required': 'country is required',
    })
})

export const UpdateShippingAddress = Joi.object({
    id: ShippingAddressId,
    user_id: Joi.number().required().messages({
        'any.required': 'user_id is required',
    }),
    address: Joi.string().messages({
        'any.required': 'address is required',
    }),
    city: Joi.string().messages({
        'any.required': 'city is required',
    }),
    province: Joi.string().messages({
        'any.required': 'Province is required',
    }),
    postal_code: Joi.string().messages({
        'any.required': 'postal_code is required',
    }),
    country: Joi.string().messages({
        'any.required': 'country is required',
    })
})