import { FastifyInstance, FastifyPluginOptions, RouteOptions } from "fastify";
import ProductController from "@adapters/inbound/controller/ProductController";

const routes: RouteOptions[] = [
    {
        method: ["GET"],
        url: "/api/v1/product/list",
        handler: ProductController.GetProductList,
    },
    {
        method: ["POST"],
        url: "/api/v1/product/detail",
        handler: ProductController.GetProductDetail,
    }
]

export default async function ProductRoute(
    fastify: FastifyInstance,
    options: FastifyPluginOptions
) {
    for (const route of routes) {
        fastify.route({ ...route, config: options });
    }
}