type BaseProperty = {
    type: string | string[]
    properties?: BaseObjectSchema
    items?: BaseProperty
    nullable?: boolean
}

type SearchKeySchema = {
    [key: string]: string
}

type BaseSchema = {
    pic: string
    search: SearchKeySchema
    additional_body?: BodySchema
}

type BaseObjectSchema = {
    [key: string]: BaseProperty
}

type BaseParamsSchema = {
    type: string
    default?: string
    items?: { type: string }
}

type BodySchema = {
    [key: string]: BaseParamsSchema
}

type BodySchemaHelper = {
    type: string
    description: string
    properties: {
        [key: string]: BaseParamsSchema | { isFile: boolean }
    }
}

type ArrayOfObject = BaseObjectSchema[]
type ArrayOfString = string[]
type ArrayOfNumber = number[]

type BaseResponseSchema = {
    type: "Array of Object" | "Boolean" | "Array of Number" | "Object" | "Array of String" | "Dynamic Key Object" | "String" | "File"
    message?: BaseObjectSchema | ArrayOfNumber | ArrayOfString | ArrayOfObject | boolean
}

const ErrorSchema = {
    statusCode: { type: "integer" },
    code: { type: "string" },
    error: { type: "string" },
    message: { type: "string" },
}

const errorResponse = {
    400: {
        description: "Bad Request",
        type: "object",
        properties: ErrorSchema,
    },
    401: {
        description: "Unauthorized",
        type: "object",
        properties: ErrorSchema,
    },
    403: {
        description: "Forbidden",
        type: "object",
        properties: ErrorSchema,
    },
    404: {
        description: "Not Found",
        type: "object",
        properties: ErrorSchema,
    },
    405: {
        description: "Method Not Allowed",
        type: "object",
        properties: ErrorSchema,
    },
    408: {
        description: "Request Timeout",
        type: "object",
        properties: ErrorSchema,
    },
    409: {
        description: "Conflict",
        type: "object",
        properties: ErrorSchema,
    },
    500: {
        description: "Internal Server Error",
        type: "object",
        properties: ErrorSchema,
    },
}

export const ResponseSchema = ({ type, message }: BaseResponseSchema) => {
    let sub

    const isMessageObject = typeof message != "boolean" && typeof message != "string"

    if (type == "Array of Object" && isMessageObject) {
        sub = {
            type: "array",
            items: {
                type: "object",
                properties: {
                    ...message,
                },
            },
        }
    } else if (type == "Boolean") {
        sub = {
            type: "boolean",
        }
    } else if (type == "Array of String") {
        sub = {
            type: "array",
            items: {
                type: "string",
            },
        }
    } else if (type == "Array of Number") {
        sub = {
            type: "array",
            items: {
                type: "number",
            },
        }
    } else if (type == "Object" && isMessageObject) {
        sub = {
            type: "object",
            properties: {
                ...message,
            },
        }
    }

    const schema = {
        200: {
            type: "object",
            properties: {
                message: sub,
            },
        },
        ...errorResponse,
    }

    return schema
}

//Request schema for non pagination.
export const BaseRequestSchema = (pic: string, requestBodyProperties: BodySchema) => {
    const BaseRequestSchema: BodySchemaHelper = {
        type: "object",
        description: `PIC: ${pic}`,
        properties: {}, //Example: limit: { type: "integer", default: 500 }
    }

    for (const data in requestBodyProperties) {
        if (requestBodyProperties[data].type == "file") {
            BaseRequestSchema.properties[data] = { isFile: true }
        } else {
            BaseRequestSchema.properties[data] = requestBodyProperties[data]
        }
    }

    return BaseRequestSchema
}

export const BasePaginationRequestSchema = ({ pic, search, additional_body }: BaseSchema) => {
    const baseSchema = {
        type: "object",
        description: `PIC: ${pic}`,
        properties: {
            //Default values are provided as an example
            search: { type: "string", description: `Search is required but can be an empty string, Example of search properties: ${JSON.stringify(search)}` },
            limit: { type: "integer" },
            lastId: { type: "integer" },
            sort: { type: "string", description: "ASC/DESC. Default is DESC if value is not provided" },
        },
        // additionalProperties: true, //Additional properties that are extending from base request (e.g., orderBy)
    }

    if (additional_body !== undefined) {
        if (Object.keys(additional_body).length != 0) {
            // Add custom property to schema
            baseSchema.properties = { ...baseSchema.properties, ...additional_body }
        }
    }

    return baseSchema
}

//Result schema for pagination
export const BasePaginationResultSchema = {
    200: {
        description: "Successful response",
        type: "object",
        properties: {
            message: {
                type: "object",
                properties: {
                    // Data below could be an array with array as items, or an array with object as items
                    data: {
                        description: "type of data is array of array, in child array can contain string, number, object, null, boolean",
                        type: "array",
                        items: {
                            type: "array",
                            anyOf: [
                                {
                                    type: "array",
                                    items: {
                                        anyOf: [{ type: "string" }, { type: "integer" }, { type: "boolean" }, { type: "object", additionalProperties: true }],
                                    },
                                },
                            ],
                        },
                    },
                    column: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                    },
                    lastId: { type: "integer" },
                    hasNext: { type: "boolean" },
                    currentPageDataCount: { type: "integer" },
                },
            },
        },
    },
    ...errorResponse,
}

export const BaseResponse = ({ type, message }: BaseResponseSchema) => {
    let sub

    if (type == "String") {
        sub = {
            type: "string",
        }
    } else if (type == "Array of Object" && typeof message != "boolean" && typeof message != "string") {
        sub = {
            type: "array",
            items: {
                type: "object",
                properties: {
                    ...message,
                },
            },
        }
    } else if (type == "Boolean") {
        sub = {
            type: "boolean",
        }
    } else if (type == "Array of String") {
        sub = {
            type: "array",
            items: {
                type: "string",
            },
        }
    } else if (type == "Array of Number") {
        sub = {
            type: "array",
            items: {
                type: "number",
            },
        }
    } else if (type == "Object" && typeof message != "boolean" && typeof message != "string") {
        sub = {
            type: "object",
            properties: {
                ...message,
            },
        }
    }

    const schema = {
        200: {
            type: "object",
            properties: {
                message: sub,
            },
        },
        ...errorResponse,
    }

    return schema
}
