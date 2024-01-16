import Joi from "joi"
import { Email, Name, Password } from "./User"

export const UserId = Joi.number().min(1).required().messages({
    "number.base": "user_id must be a number",
    "number.min": "user_id must be greater than or equal to 1",
    "any.required": "user_id is a required field",
})

export const GetAdminProfile = UserId.required().messages({
    "any.required": "Id is required",
})

export const CreateUser = Joi.object({
    id: UserId,
    email: Email,
    name: Name,
    password: Password,
    level: Joi.number().valid(3).required().messages({
        "any.required": "level is required",
    }),
}).options({ abortEarly: false })

export const UpdateProfileUser = Joi.object({
    id: UserId,
    userid: UserId,
    email: Email,
    name: Name,
}).options({ abortEarly: false })

export const UpdateProfile = Joi.object({
    id: UserId,
    email: Email,
    name: Name,
}).options({ abortEarly: false })

export const DeleteUser = Joi.object({
    id: UserId,
    email: Email,
}).options({ abortEarly: false })

export const GetUserDetailProfile = Joi.object({
    id: UserId,
    email: Email,
}).options({ abortEarly: false })

//default existing rules starting from 100
export const RulesId = Joi.number().integer().greater(100).required().messages({
    "number.base": "rules_id must be a number",
    "number.integer": "rules_id must be an integer",
    "number.greater": "rules_id must be greater than 100",
    "any.required": "rules_id is required",
})

//Rules can only be alphabets, upppercase and separated by underscore.
export const Rules = Joi.string()
    .pattern(/^[A-Z_]*$/)
    .required()
    .messages({
        "string.base": "rule must be a string",
        "string.pattern.base": "rule must be uppercased and separated with underscore",
        "any.required": "rule is required",
    })

export const GroupId = Joi.number().integer().greater(0).max(6).required().messages({
    "any.required": "group_id is required",
    "number.base": "group_id must be a number",
    "number.integer": "group_id must be an integer",
    "number.greater": "group_id must be greater than 0",
    "number.max": "group_id must be lesser than 6",
})

export const CreateRule = Rules

export const UpdateRule = Joi.object({
    rules_id: RulesId,
    rule: Rules,
}).options({ abortEarly: false })

export const AssignRule = Joi.object({
    rules_id: RulesId,
    group_id: GroupId,
}).options({ abortEarly: false })

export const RevokeRule = Joi.object({
    rules_id: RulesId,
    group_id: GroupId,
}).options({ abortEarly: false })

export const ChangeUserPass = Joi.object({
    userid: UserId,
    password: Password,
    confirmPassword: Password,
})

export const ChangePassword = Joi.object({
    id: UserId,
    oldPassword: Password,
    newPassword: Password,
}).options({ abortEarly: false })

export const UpdateUserLevel = Joi.object({
    user_id: UserId,
    level: Joi.number().valid(4, 5, 6).required().messages({
        "any.required": "Level is required",
    }),
}).options({ abortEarly: false })
