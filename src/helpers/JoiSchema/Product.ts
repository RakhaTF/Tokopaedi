import Joi from "joi";

export const ProductId = Joi.number().min(1).required().messages({
  'number.base': 'id must be a number',
  'number.min': 'id must be greater than or equal to 1',
  'any.required': 'id is a required field',
});

export const CreateProduct = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().max(100).alphanum().required(),
  price: Joi.number().min(1).required(),
  stock: Joi.number().min(1).required(),
})

export const UpdateProduct = Joi.object({
  id: ProductId,
  name: Joi.string(),
  description: Joi.string().max(100).alphanum(),
  price: Joi.number().min(1),
  stock: Joi.number().min(1),
})