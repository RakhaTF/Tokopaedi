import { FastifyInstance, FastifyPluginOptions, RouteOptions } from "fastify"
import ProductController from "@adapters/inbound/controller/ProductController"
import * as Schema from "@helpers/ApiSchema/ApiSchema"
import TransactionController from "@adapters/inbound/controller/TransactionController"

const routes: RouteOptions[] = [
    {
        method: ["POST"],
        url: "list",
        handler: ProductController.GetProductList,
        schema: {
            tags: ["Product"],
            body: Schema.BasePaginationRequestSchema({
                pic: "Rakha",
                search: {
                    name: "string",
                },
                additional_body: {
                    sortFilter: { type: "string", enum: ["mostReviewed", "highestPrice", "lowestPrice", "lowestRating", "highestRating"] },
                    categoriesFilter: { type: "string" },
                    ratingSort: { type: "string" },
                    priceMin: { type: "number" },
                    priceMax: { type: "number" },
                },
            }),
            response: Schema.BasePaginationResultSchema,
        },
    },
    {
        method: ["POST"],
        url: "detail",
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
                    category_name: { type: "string" },
                    price: { type: "integer" },
                    stock: { type: "integer" },
                    rating: { type: "number" },
                    is_wishlisted: { type: "boolean" },
                    review_count: { type: "number" },
                    public_id: { type: "string" },
                    img_src: { type: "string" },
                },
            }),
        },
    },
    {
        method: ["POST"],
        url: "review/list",
        handler: ProductController.ReviewList,
        schema: {
            tags: ["Product"],
            body: Schema.BasePaginationRequestSchema({
                pic: "Rakha",
                additional_body: { id: { type: "integer" } },
                search: {},
            }),
            response: Schema.BasePaginationResultSchema,
        },
    },
    {
        method: ["POST"],
        url: "review/detail",
        handler: ProductController.ReviewDetail,
        schema: {
            tags: ["Product"],
            body: Schema.BaseRequestSchema("Rakha", { id: { type: "integer" } }),
            response: Schema.BaseResponse({
                type: "Object",
                message: {
                    id: { type: "integer" },
                    user_id: { type: "integer" },
                    name: { type: "string" },
                    product_id: { type: "integer" },
                    rating: { type: "integer" },
                    comment: { type: "string" },
                    created_at: { type: "integer" },
                },
            }),
        },
    },
    {
        method: ["POST"],
        url: "category/list",
        handler: ProductController.CategoryList,
        schema: {
            tags: ["Product"],
            body: Schema.BasePaginationRequestSchema({
                pic: "Rakha",
                search: {
                    name: "string",
                    parent_id: "string",
                },
            }),
            response: Schema.BasePaginationResultSchema,
        },
    },
    {
        method: ["POST"],
        url: "midtrans/notification",
        handler: TransactionController.MidtransNotification
    },
]

export default async function ProductRoute(fastify: FastifyInstance, options: FastifyPluginOptions) {
    for (const route of routes) {
        fastify.route({ ...route, config: options })
    }
}
