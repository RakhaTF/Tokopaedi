import { FastifyInstance, FastifyPluginOptions, RouteOptions } from "fastify";
import ProductController from "@adapters/inbound/controller/ProductController";
import { AuthValidate, CheckAuthAdmin } from "helpers/prehandler/AuthValidate";
import { Rules } from "@domain/model/Rules";

const routes: RouteOptions[] = [
    {
        method: ["POST"],
        url: "/api/v1/product/delete",
        preHandler: CheckAuthAdmin({ rules: Rules.DELETE_PRODUCT }),
        handler: ProductController.DeleteProduct,
    },
    {
        method: ["POST"],
        url: "/api/v1/product/create",
        preHandler: CheckAuthAdmin({ rules: Rules.CREATE_PRODUCT }),
        handler: ProductController.CreateProduct,
    },
    {
        method: ["POST"],
        url: "/api/v1/product/update",
        preHandler: CheckAuthAdmin({ rules: Rules.UPDATE_PRODUCT }),
        handler: ProductController.UpdateProduct,
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