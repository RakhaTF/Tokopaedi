import { FastifyInstance, FastifyPluginOptions, RouteOptions } from "fastify";
import ProductController from "@adapters/inbound/controller/ProductController";
import { AuthValidate, CheckAuthAdmin } from "helpers/prehandler/AuthValidate";
import { Rules } from "@domain/model/Rules";
import * as Schema from "helpers/ApiSchema/ApiSchema"
import AdminController from "@adapters/inbound/controller/AdminController";

const routes: RouteOptions[] = [
    {
        method: ["POST"],
        url: "/api/v1/admin/product/create",
        preHandler: CheckAuthAdmin({ rules: Rules.CREATE_PRODUCT }),
        handler: ProductController.CreateProduct,
        schema: {
            body: Schema.BaseRequestSchema("Rakha", {
                name: { type: "string" },
                description: { type: "string" },
                price: { type: "integer" },
                stock: { type: "integer" },
            }),
            response: Schema.BaseResponse({ type: 'Boolean' })
        }
    },
    {
        method: ["POST"],
        url: "/api/v1/admin/product/delete",
        preHandler: CheckAuthAdmin({ rules: Rules.DELETE_PRODUCT }),
        handler: ProductController.DeleteProduct,
        schema: {
            body: Schema.BaseRequestSchema("Rakha", { id: { type: "integer" } }),
            response: Schema.BaseResponse({ type: 'Boolean' })
        }
    },
    {
        method: ["POST"],
        url: "/api/v1/admin/product/update",
        preHandler: CheckAuthAdmin({ rules: Rules.UPDATE_PRODUCT }),
        handler: ProductController.UpdateProduct,
        schema: {
            body: Schema.BaseRequestSchema("Rakha", {
                id: { type: "integer" },
                name: { type: "string" },
                description: { type: "string" },
                price: { type: "integer" },
                stock: { type: "integer" },
            }),
            response: Schema.BaseResponse({ type: 'Boolean' })
        }
    },
    {
        method: ["GET"],
        url: "/api/v1/admin/profile",
        handler: AdminController.GetAdminProfile,
        schema: {
            response: Schema.BaseResponse({
                type: 'Object',
                message: {
                    id: {type : "number"},
                    name: {type: "string"},
                    email: {type: "string"},
                    level: {type: "number"},
                    created_at: {type: "number"},
                    group_rules: {type: "string"}
                }
            })
        }
    },
    {
        method: ["POST"],
        url: "/api/v1/admin/create-user",
        preHandler: CheckAuthAdmin({ rules: Rules.CREATE_USER }),
        handler: AdminController.CreateUser,
        schema: {
            body: Schema.BaseRequestSchema('Raihan',{
                name: {type: 'string'},
                email: {type: 'string'},
                password: {type: 'string'}
            }),
            response: Schema.BaseResponse({
                type: 'Object',
                message: {
                    id: {type : "number"},
                    name: {type: "string"},
                    email: {type: "string"},
                    level: {type: "number"},
                    created_at: {type: "number"},
                }
            })
        }
    },
    {
        method: ["POST"],
        url: "/api/v1/admin/update-user",
        preHandler: CheckAuthAdmin({ rules: Rules.UPDATE_USER_PROFILE }),
        handler: AdminController.UpdateProfileUser,
        schema: {
            body: Schema.BaseRequestSchema('Raihan',{
                userid: {type: 'number'},
                name: {type: 'string'},
                email: {type: 'string'}
            }),
            response: Schema.BaseResponse({
                type: 'Object',
                message: {
                    id: {type: 'number'},
                    email: {type: 'string'},
                    name: {type: 'string'}
                }
            })
        }
    },
    {
        method: ["POST"],
        url: "/api/v1/admin/update-profile",
        handler: AdminController.UpdateProfile,
        schema: {
            body: Schema.BaseRequestSchema('Raihan',{
                name: {type: 'string'},
                email: {type: 'string'}
            }),
            response: Schema.BaseResponse({
                type: 'Object',
                message: {
                    id: {type: 'number'},
                    email: {type: 'string'},
                    name: {type: 'string'}
                }
            })
        }
    },
    {
        method: ["POST"],
        url: "/api/v1/admin/delete-user",
        preHandler: CheckAuthAdmin({ rules: Rules.DELETE_USER }),
        handler: AdminController.DeleteUser,
        schema: {
            body: Schema.BaseRequestSchema('Raihan',{
                email: {type: 'string'}
            }),
            response: Schema.BaseResponse({
                type: 'Boolean'
            })
        }
    },
    {
        method: ["GET"],
        url: "/api/v1/admin/user-list",
        preHandler: CheckAuthAdmin({ rules : Rules.VIEW_USER_LIST }),
        handler: AdminController.GetUserList,
        schema: {
            response: Schema.BaseResponse({
                type: 'Array of Object',
                message: {
                    id: {type: 'number'},
                    email: {type: 'string'},
                    name: {type: 'string'},
                    created_at: {type: 'number'}
                }
            })
        }
    },
    {
        method: ["POST"],
        url: "/api/v1/admin/user-detail",
        preHandler: CheckAuthAdmin({ rules : Rules.VIEW_USER_PROFILE }),
        handler: AdminController.GetUserDetailProfile,
        schema: {
            body: Schema.BaseRequestSchema('Raihan',{
                email: {type: 'string'}
            }),
            response: Schema.BaseResponse({
                type: 'Object',
                message: {
                    id: {type: 'number'},
                    email: {type: 'string'},
                    name: {type: 'string'},
                    created_at: {type: 'number'}
                }
            })
        }
    }
]

export default async function AdminRoute(
    fastify: FastifyInstance,
    options: FastifyPluginOptions
) {
    fastify.addHook("preValidation", AuthValidate)
    for (const route of routes) {
        fastify.route({ ...route, config: options });
    }
}