import { FastifyInstance, FastifyPluginOptions, RouteOptions } from "fastify"
import { AuthValidate } from "helpers/prehandler/AuthValidate"
import UserController from "@adapters/inbound/controller/UserController"
import * as Schema from "helpers/ApiSchema/ApiSchema"
import ShippingAddressController from "@adapters/inbound/controller/ShippingAddressController"
import TransactionController from "@adapters/inbound/controller/TransactionController"

const routes: RouteOptions[] = [
    {
        method: ["GET"],
        url: "profile",
        handler: UserController.GetUserProfile,
        schema: {
            tags: ["User"],
            response: Schema.BaseResponse({
                type: "Object",
                message: {
                    id: { type: "number" },
                    name: { type: "string" },
                    email: { type: "string" },
                    level: { type: "number" },
                    created_at: { type: "number" },
                    group_rules: { type: "string" },
                },
            }),
        },
    },
    {
        method: ["POST"],
        url: "profile/update",
        handler: UserController.UpdateUserProfile,
        schema: {
            tags: ["User"],
            body: Schema.BaseRequestSchema("Raihan", {
                email: { type: "string" },
                name: { type: "string" },
            }),
            response: Schema.BaseResponse({
                type: "Object",
                message: {
                    id: { type: "number" },
                    email: { type: "string" },
                    name: { type: "string" },
                },
            }),
        },
    },
    {
        method: ["POST"],
        url: "shipping-address/create",
        handler: ShippingAddressController.CreateShippingAddress,
        schema: {
            tags: ["User"],
            body: Schema.BaseRequestSchema("Rakha", {
                address: { type: "string" },
                postal_code: { type: "string" },
                city: { type: "string" },
                province: { type: "string" },
                country: { type: "string" },
            }),
            response: Schema.BaseResponse({ type: "Boolean" }),
        },
    },
    {
        method: ["POST"],
        url: "shipping-address/detail",
        handler: ShippingAddressController.GetShippingAddressDetail,
        schema: {
            tags: ["User"],
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
                    country: { type: "string" },
                },
            }),
        },
    },
    {
        method: ["POST"],
        url: "shipping-address/list",
        handler: ShippingAddressController.GetShippingAddressList,
        schema: {
            tags: ["User"],
            body: Schema.BasePaginationRequestSchema({
                pic: "Raihan",
                search: {
                    id: "number",
                    user_id: "number",
                    city: "string",
                },
            }),
            response: Schema.BasePaginationResultSchema,
        },
    },
    {
        method: ["POST"],
        url: "shipping-address/update",
        handler: ShippingAddressController.UpdateShippingAddress,
        schema: {
            tags: ["User"],
            body: Schema.BaseRequestSchema("Rakha", {
                address: { type: "string" },
                postal_code: { type: "string" },
                city: { type: "string" },
                province: { type: "string" },
                country: { type: "string" },
            }),
            response: Schema.BaseResponse({ type: "Boolean" }),
        },
    },
    {
        method: ["POST"],
        url: "shipping-address/delete",
        handler: ShippingAddressController.DeleteShippingAddress,
        schema: {
            tags: ["User"],
            body: Schema.BaseRequestSchema("Rakha", { id: { type: "integer" } }),
            response: Schema.BaseResponse({ type: "Boolean" }),
        },
    },
    {
        method: ["POST"],
        url: "transaction/create",
        handler: TransactionController.CreateTransaction,
        schema: {
            tags: ["User"],
            body: Schema.BaseRequestSchema("Raihan", {
                product_id: { type: "array", items: { type: "number" } },
                qty: { type: "array", items: { type: "number" } },
            }),
            response: Schema.BaseResponse({ type: "Boolean" }),
        },
    },
    {
        method: ["POST"],
        url: "transaction/update-product-quantity",
        handler: TransactionController.UpdateTransactionProductQty,
        schema: {
            tags: ["User"],
            body: Schema.BaseRequestSchema("Raihan", {
                product_id: { type: "number" },
                order_id: { type: "number" },
                qty: { type: "number" },
            }),
            response: Schema.BaseResponse({ type: "Boolean" }),
        },
    },
    {
        method: ["POST"],
        url: "transaction/pay",
        handler: TransactionController.PayTransaction,
        schema: {
            tags: ["User"],
            body: Schema.BaseRequestSchema("Rakha", {
                transaction_id: { type: "number" },
                payment_method: { type: "string" },
                shipping_address_id: { type: "number" },
                expedition_name: { type: "string" },
            }),
            response: Schema.BaseResponse({ type: "Boolean" }),
        },
    },
    {
        method: ["POST"],
        url: "transaction/detail",
        handler: TransactionController.TransactionDetail,
        schema: {
            tags: ["User"],
            body: Schema.BaseRequestSchema("Rakha", { id: { type: "number" } }),
            response: Schema.BaseResponse({
                type: "Object",
                message: {
                    user_id: { type: "number" },
                    transaction_id: { type: "number" },
                    name: { type: "string" },
                    product_bought: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                product_name: { type: "string" },
                                qty: { type: "string" },
                            },
                        },
                    },
                    items_price: { type: "number" },
                    shipping_price: { type: "number" },
                    total_price: { type: "number" },
                    is_paid: { type: "string" },
                    paid_at: { type: "string" },
                    transaction_status: { type: "string" },
                    delivery_status: { type: "string" },
                    shipping_address: {
                        type: "object",
                        properties: {
                            address: { type: "string" },
                            postal_code: { type: "string" },
                            city: { type: "string" },
                            province: { type: "string" },
                            country: { type: "string" },
                        },
                    },
                    created_at: { type: "string" },
                    expire_at: { type: "string" },
                },
            }),
        },
    },
    {
        method: ["POST"],
        url: "transaction/delete",
        handler: UserController.DeleteTransaction,
        schema: {
            tags: ["User"],
            body: Schema.BaseRequestSchema("Rakha", { id: { type: "number" } }),
            response: Schema.BaseResponse({ type: "Boolean" }),
        },
    },
    {
        method: ["POST"],
        url: "transaction/list",
        handler: UserController.TransactionList,
        schema: {
            tags: ["User"],
            body: Schema.BasePaginationRequestSchema({
                pic: "Rakha",
                search: {
                    payment: "string",
                    shipped_to: "number",
                    items_price: "number",
                    total_price: "number",
                    created: "number",
                },
            }),
            response: Schema.BasePaginationResultSchema,
        },
    },
    {
        method: ["POST"],
        url: "change-pass",
        handler: UserController.ChangePassword,
        schema: {
            tags: ["User"],
            body: Schema.BaseRequestSchema("Raihan", {
                oldPassword: { type: "string" },
                newPassword: { type: "string" },
            }),
            response: Schema.BaseResponse({
                type: "Boolean",
            }),
        },
    },
]

export default async function UserRoute(fastify: FastifyInstance, options: FastifyPluginOptions) {
    fastify.addHook("preValidation", AuthValidate)
    for (const route of routes) {
        fastify.route({ ...route, config: options })
    }
}
