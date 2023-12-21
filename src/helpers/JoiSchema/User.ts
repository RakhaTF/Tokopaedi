import Joi from "joi"

export const Register = Joi.object({
    name: Joi.string()
        .min(3)
        .required()
        .max(50)
        .regex(/^[a-zA-Z ]+$/)
        .messages({
            "any.required": "name is required",
        }),
    email: Joi.string().email().required().messages({
        "any.required": "Email is required",
        "string.email": "Email must be a valid email",
    }),
    password: Joi.string().alphanum().min(8).max(12).required().messages({
        "any.required": "Password is required",
    }),
    level: Joi.number().valid(3).required().messages({
        "any.required": "level is required",
    }),
}).options({ abortEarly: false })

export const Login = Joi.object({
    email: Joi.string().email().required().messages({
        "any.required": "Email is required",
        "string.email": "Email must be a valid email",
    }),
    password: Joi.string().alphanum().min(8).required().messages({
        "any.required": "Password is required",
    }),
}).options({ abortEarly: false })

export const GetUserProfile = Joi.object({
    id: Joi.number().required().messages({
        "any.required": "Id is required",
    }),
}).options({ abortEarly: false })

export const UpdateUserProfile = Joi.object({
    id: Joi.number().required().messages({
        "any.required": "Id is required",
    }),
    email: Joi.string().email().required().messages({
        "any.required": "Email is required",
        "string.email": "Email must be a valid email",
    }),
    name: Joi.string()
        .min(3)
        .required()
        .max(50)
        .regex(/^[a-zA-Z ]+$/)
        .messages({
            "any.required": "name is required",
        }),
}).options({ abortEarly: false })

export const ChangePassword = Joi.object({
    id: Joi.number().required().messages({
        "any.required": "Id is required",
    }),
    oldPassword: Joi.string().required().messages({
        "any.required": "Old Password is required",
    }),
    newPassword: Joi.string().alphanum().min(8).max(12).required().messages({
        "any.required": "New Password is required",
    }),
}).options({ abortEarly: false })
