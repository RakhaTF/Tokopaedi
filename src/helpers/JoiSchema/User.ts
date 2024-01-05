import Joi from "joi"

export const UserId = Joi.number().min(0).messages({
    "number.base": "user_id must be a number",
    "number.min": "user_id must be greater than or equal to 1",
})

export const Password = Joi.string().alphanum().min(8).max(12).required().messages({
    "any.required": "Password is required",
    "string.alphanum": "Password must only contain alphanumeric characters",
    "string.min": "Password must be at least 8 characters long",
    "string.max": "Password must be no more than 12 characters long",
})

export const Name = Joi.string()
    .min(3)
    .required()
    .max(50)
    .regex(/^[a-zA-Z ]+$/)
    .messages({
        "any.required": "name is required",
        "string.min": "name must be at least 3 characters long",
    })

export const Email = Joi.string().email().required().messages({
    "any.required": "Email is required",
    "string.email": "Email must be a valid email",
})

export const Register = Joi.object({
    name: Name,
    email: Email,
    password: Password,
    level: Joi.number().valid(3).required().messages({
        "any.required": "level is required",
    }),
}).options({ abortEarly: false })

export const Login = Joi.object({
    email: Email,
    password: Password,
}).options({ abortEarly: false })

export const GetUserProfile = UserId

export const UpdateUserProfile = Joi.object({
    id: UserId.required().messages({
        "any.required": "user_id is required",
    }),
    email: Email,
    name: Name,
}).options({ abortEarly: false })

export const ChangePassword = Joi.object({
    id: UserId.required().messages({
        "any.required": "Id is required",
    }),
    oldPassword: Password,
    newPassword: Password,
}).options({ abortEarly: false })

export const VerifyEmail = Joi.string().required()
