import Joi from "joi"

export const Register = Joi.object({
    name: Joi.string().min(3).required().max(50).regex(/^[a-zA-Z ]+$/).messages({
        'any.required': 'name is required',
    }),
    email: Joi.string().email().required().messages({
        'any.required': 'Email is required',
        'string.email': 'Email must be a valid email',
    }),
    password: Joi.string().alphanum().min(8).max(12).required().messages({
        'any.required': 'Password is required',
    }),
    level: Joi.number().valid(2,3).required().messages({
        'any.required': 'level is required',
    }),
}).options({ abortEarly: false });

export const UpdateUser = Joi.object({
    firstName: Joi.string().alphanum().min(3).required().messages({
        'any.required': 'First name is required',
    }),
    lastName: Joi.string().alphanum().min(3).required().messages({
        'any.required': 'Last name is required',
    }),
    password: Joi.string().alphanum().min(8).required().messages({
        'any.required': 'Password is required',
    }),
    age: Joi.number().min(5).required().messages({
        'any.required': 'Age is required',
    }),
    email: Joi.string().email().required().messages({
        'any.required': 'Email is required',
        'string.email': 'Email must be a valid email',
    }),
}).options({ abortEarly: false });

export const Login = Joi.object({
    email: Joi.string().email().required().messages({
        'any.required': 'Email is required',
        'string.email': 'Email must be a valid email',
    }),
    password: Joi.string().alphanum().min(8).required().messages({
        'any.required': 'Password is required',
    }),
}).options({ abortEarly: false });