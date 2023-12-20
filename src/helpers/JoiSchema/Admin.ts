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

//default existing rules starting from 100
export const RulesId = Joi.number().integer().greater(100).required().messages({
    'number.base': 'rules_id must be a number',
    'number.integer': 'rules_id must be an integer',
    'number.greater': 'rules_id must be greater than 100',
    'any.required': 'rules_id is required',
});

//Rules can only be alphabets, upppercase and separated by underscore.
export const Rules = Joi.string().pattern(new RegExp('^[A-Z_]*$')).required().messages({
    'string.base': 'rule must be a string',
    'string.pattern.base': 'rule must be uppercased and separated with underscore',
    'any.required': 'rule is required',
})

export const GroupId = Joi.number().integer().greater(0).max(6).required().messages({
    'any.required': 'group_id is required',
    'number.base': 'group_id must be a number',
    'number.integer': 'group_id must be an integer',
    'number.greater': 'group_id must be greater than 0',
    'number.max': 'group_id must be lesser than 6'
})

export const CreateRule = Rules

export const UpdateRule = Joi.object({
    rules_id: RulesId,
    rule: Rules
}).options({ abortEarly: false });

export const AssignRule = Joi.object({
    rules_id: RulesId,
    group_id: GroupId
}).options({ abortEarly: false });

export const RevokeRule = Joi.object({
    rules_id: RulesId,
    group_id: GroupId
}).options({ abortEarly: false });

export const ChangeUserPass = Joi.object({
    userid: Joi.number().required().messages({
        'any.required': 'User Id is required',
    }),
    password: Joi.string().alphanum().min(8).required().messages({
        'any.required': 'Password is required',
    }),
    confirmPassword: Joi.string().alphanum().min(8).required().messages({
        'any.required': 'Confirmation Password is required',
    }),
})

export const ChangePassword = Joi.object({
    id: Joi.number().required().messages({
        'any.required': 'Id is required',
    }),
    oldPassword: Joi.string().required().messages({
        'any.required': 'Old Password is required',
    }),
    newPassword: Joi.string().alphanum().min(8).max(12).required().messages({
        'any.required': 'New Password is required',
    })
}).options({ abortEarly: false });

export const UpdateUserLevel = Joi.object({
    user_id: Joi.number().required().messages({
        'any.required': 'User Id is required',
    }),
    level: Joi.number().valid(4, 5, 6).required().messages({
        'any.required': 'Level is required',
    })
}).options({ abortEarly: false });