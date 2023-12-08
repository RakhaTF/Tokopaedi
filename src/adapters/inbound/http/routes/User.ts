import { Rules } from "@domain/model/Rules";
import { FastifyInstance, FastifyPluginOptions, RouteOptions } from "fastify";
import { AuthValidate, CheckAuthAdmin } from "helpers/prehandler/AuthValidate";
import UserController from "@adapters/inbound/controller/UserController";
import * as Schema from "helpers/ApiSchema/ApiSchema"
import ShippingAddressController from "@adapters/inbound/controller/ShippingAddressController";

const routes: RouteOptions[] = [
    {
        method: ["GET"],
        url: "/api/v1/user/profile",
        preHandler: CheckAuthAdmin({rules: Rules.VIEW_PROFILE_DETAIL}),
        handler: UserController.GetUserProfile,
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
        url: "/api/v1/user/profile/update",
        handler: UserController.UpdateUserProfile,
        schema: {
            body: Schema.BaseRequestSchema('Raihan', {
                    email: {type : 'string'},
                    name: {type: 'string'}
                }
            ),
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
        url: "/api/v1/user/shipping-address/create",
        handler: ShippingAddressController.CreateShippingAddress,
        schema: {
            body: Schema.BaseRequestSchema("Rakha", {
                address: { type: "string" },
                postal_code: { type: "string" },
                city: { type: "string" },
                province: { type: "string" },
                country: { type: "string" }
            }),
            response: Schema.BaseResponse({ type: "Boolean" })
        }
    },
    {
        method: ["POST"],
        url: "/api/v1/user/shipping-address/detail",
        handler: ShippingAddressController.GetShippingAddressDetail,
        schema: {
            body: Schema.BaseRequestSchema("Rakha", { id: { type: "integer" } }),
            response: Schema.BaseResponse({
                type: "Object",
                message: {
                    id: { type: "integer" },
                    user_id: { type: "integer" },
                    address: { type: "string" },
                    postal_code: { type: "string" },
                    city: { type: "string" },
                    province: { type: "string" },
                    country: { type: "string" }
                }
            })
        }
    },
    {
        method: ["GET"],
        url: "/api/v1/user/shipping-address/list",
        handler: ShippingAddressController.GetShippingAddressList,
        schema: {
            response: Schema.BaseResponse({
                type: "Array of Object",
                message: {
                    id: { type: "integer" },
                    user_id: { type: "integer" },
                    address: { type: "string" },
                    postal_code: { type: "string" },
                    city: { type: "string" },
                    province: { type: "string" },
                    country: { type: "string" }
                }
            })
        }
    },
    {
        method: ["POST"],
        url: "/api/v1/user/shipping-address/update",
        handler: ShippingAddressController.UpdateShippingAddress,
        schema: {
            body: Schema.BaseRequestSchema("Rakha", {
                address: { type: "string" },
                postal_code: { type: "string" },
                city: { type: "string" },
                province: { type: "string" },
                country: { type: "string" }
            }),
            response: Schema.BaseResponse({ type: "Boolean" })
        }
    },
    {
        method: ["POST"],
        url: "/api/v1/user/shipping-address/delete",
        handler: ShippingAddressController.DeleteShippingAddress,
        schema: {
            body: Schema.BaseRequestSchema("Rakha", { id: { type: "integer" } }),
            response: Schema.BaseResponse({ type: "Boolean" })
        }
    }
]

export default async function UserRoute(
    fastify: FastifyInstance,
    options: FastifyPluginOptions
) {
    fastify.addHook("preValidation", AuthValidate)
    for (const route of routes) {
        fastify.route({ ...route, config: options });
    }
}