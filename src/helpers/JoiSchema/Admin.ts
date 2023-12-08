import Joi from "joi"

export const GetAdminProfile = Joi.object({
    id: Joi.number().required().messages({
        'any.required': 'Id is required',
    }),
}).options({ abortEarly: false });

export const CreateUser = Joi.object({
    id: Joi.number().required().messages({
        'any.required': 'Id is required',
    }),
    email: Joi.string().email().required().messages({
        'any.required': 'Email is required',
        'string.email': 'Email must be a valid email',
    }),
    name: Joi.string().min(3).required().max(50).regex(/^[a-zA-Z ]+$/).messages({
        'any.required': 'name is required',
    }),
    password: Joi.string().alphanum().min(8).required().messages({
        'any.required': 'Password is required',
    }),
    level: Joi.number().valid(3).required().messages({
        'any.required': 'level is required',
    }),
})

export const UpdateProfileUser = Joi.object({
    id: Joi.number().required().messages({
        'any.required': 'Id is required',
    }),
    userid: Joi.number().required().messages({
        'any.required': 'Id is required',
    }),
    email: Joi.string().email().required().messages({
        'any.required': 'Email is required',
        'string.email': 'Email must be a valid email',
    }),
    name: Joi.string().min(3).required().max(50).regex(/^[a-zA-Z ]+$/).messages({
        'any.required': 'name is required',
    })
}).options({ abortEarly: false });

export const UpdateProfile = Joi.object({
    id: Joi.number().required().messages({
        'any.required': 'Id is required',
    }),
    email: Joi.string().email().required().messages({
        'any.required': 'Email is required',
        'string.email': 'Email must be a valid email',
    }),
    name: Joi.string().min(3).required().max(50).regex(/^[a-zA-Z ]+$/).messages({
        'any.required': 'name is required',
    })
}).options({ abortEarly: false });

export const DeleteUser = Joi.object({
    id: Joi.number().required().messages({
        'any.required': 'Id is required',
    }),
    email: Joi.string().email().required().messages({
        'any.required': 'Email is required',
        'string.email': 'Email must be a valid email',
    })
}).options({ abortEarly: false });

export const GetUserDetailProfile = Joi.object({
    id: Joi.number().required().messages({
        'any.required': 'Id is required',
    }),
    email: Joi.string().email().required().messages({
        'any.required': 'Email is required',
        'string.email': 'Email must be a valid email',
    })
}).options({ abortEarly: false });
