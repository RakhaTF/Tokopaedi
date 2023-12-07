import { FastifyInstance, FastifyPluginOptions, RouteOptions } from "fastify";
import { AuthValidate } from "helpers/prehandler/AuthValidate";
import ShippingAddressController from "@adapters/inbound/controller/ShippingAddressController";
import * as Schema from "helpers/ApiSchema/ApiSchema"

const routes: RouteOptions[] = [
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
            body: Schema.BaseRequestSchema("Rakha", {
                address: { type: "string" },
                postal_code: { type: "string" },
                city: { type: "string" },
                province: { type: "string" },
                country: { type: "string" }
            }),
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

export default async function ShippingAddressRoute(
    fastify: FastifyInstance,
    options: FastifyPluginOptions
) {
    fastify.addHook("preValidation", AuthValidate)
    for (const route of routes) {
        fastify.route({ ...route, config: options });
    }
}