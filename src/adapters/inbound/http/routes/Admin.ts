import { FastifyInstance, FastifyPluginOptions, RouteOptions } from "fastify";
import ProductController from "@adapters/inbound/controller/ProductController";
import { AuthValidate, CheckAuthAdmin } from "helpers/prehandler/AuthValidate";
import { Rules } from "@domain/model/Rules";
import * as Schema from "helpers/ApiSchema/ApiSchema"

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