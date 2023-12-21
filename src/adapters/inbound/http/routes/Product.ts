import { FastifyInstance, FastifyPluginOptions, RouteOptions } from "fastify"
import ProductController from "@adapters/inbound/controller/ProductController"
import * as Schema from "helpers/ApiSchema/ApiSchema"

const routes: RouteOptions[] = [
    {
        method: ["POST"],
        url: "/api/v1/product/list",
        handler: ProductController.GetProductList,
        // schema: {
        //     tags: ["Product"],
        //     response: Schema.BaseResponse({
        //         type: "Array of Object",
        //         message: {
        //             id: { type: "integer" },
        //             name: { type: "string" },
        //             description: { type: "string" },
        //             price: { type: "integer" },
        //             stock: { type: "integer" }
        //         }
        //     })
        // }
    },
    {
        method: ["POST"],
        url: "/api/v1/product/detail",
        handler: ProductController.GetProductDetail,
        schema: {
            tags: ["Product"],
            body: Schema.BaseRequestSchema("Rakha", { id: { type: "integer" } }),
            response: Schema.BaseResponse({
                type: "Object",
                message: {
                    id: { type: "integer" },
                    name: { type: "string" },
                    description: { type: "string" },
                    price: { type: "integer" },
                    stock: { type: "integer" },
                },
            }),
        },
    },
]

export default async function ProductRoute(fastify: FastifyInstance, options: FastifyPluginOptions) {
    for (const route of routes) {
        fastify.route({ ...route, config: options })
    }
}
