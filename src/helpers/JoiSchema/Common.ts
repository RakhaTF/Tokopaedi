import Joi from "joi"

const limit = Joi.number().min(1).messages({
    "number.base": "limit must be a number",
    "number.min": "limit must be greater than or equal to 1",
})
const search = Joi.string().allow("").messages({
    "string.base": "search must be a string",
})
const sort = Joi.string().valid("ASC", "DESC").messages({
    "string.base": "sort must be a string",
    "any.only": "sort must be either ASC or DESC",
})
const lastId = Joi.number().min(0).messages({
    "number.base": "lastId must be a number",
    "number.min": "lastId must be greater than or equal to 0",
})

export const Pagination = Joi.object({
    limit,
    search,
    sort,
    lastId,
})
    .unknown(true)
    .options({ abortEarly: false })
