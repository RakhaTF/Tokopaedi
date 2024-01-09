import Joi from "joi"

export const ProductId = Joi.number().min(1).required().messages({
    "number.base": "id must be a number",
    "number.min": "id must be greater than or equal to 1",
    "any.required": "id is a required field",
})

const Price = Joi.number().min(1).messages({
    "number.base": "Price must be a number",
    "number.min": "Price must be greater than or equal to 1",
})

const Description = Joi.string()
    .max(100)
    .pattern(/^[a-zA-Z0-9 _-]*$/)
    .messages({
        "string.base": "Description must be a string",
        "string.max": "Description must be no more than 100 characters long",
    })

const Stock = Joi.number().min(1).messages({
    "number.base": "Stock must be a number",
    "number.min": "Stock must be greater than or equal to 1",
})

const Name = Joi.string().messages({
    "string.base": "Name must be a string",
})

export const CreateProduct = Joi.object({
    name: Name.required().messages({
        "any.required": "Product name is required",
    }),
    description: Description.required().messages({
        "any.required": "Description is required",
    }),
    price: Price.required().messages({
        "any.required": "Price is required",
    }),
    stock: Stock.required().messages({
        "any.required": "Stock is required",
    }),
}).options({ abortEarly: false }).unknown(true)

export const UpdateProduct = Joi.object({
    id: ProductId,
    name: Name,
    description: Description,
    price: Price,
    stock: Stock,
}).options({ abortEarly: false })
