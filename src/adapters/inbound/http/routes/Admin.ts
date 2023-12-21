import { FastifyInstance, FastifyPluginOptions, RouteOptions } from "fastify";
import ProductController from "@adapters/inbound/controller/ProductController";
import { AuthValidate, CheckAuthAdmin } from "helpers/prehandler/AuthValidate";
import { Rules } from "@domain/model/Rules";
import * as Schema from "helpers/ApiSchema/ApiSchema"
import AdminController from "@adapters/inbound/controller/AdminController";
import LogController from "@adapters/inbound/controller/LogController";

const routes: RouteOptions[] = [
    {
        method: ["POST"],
        url: "/api/v1/admin/product/create",
        preHandler: CheckAuthAdmin({ rules: Rules.CREATE_PRODUCT }),
        handler: ProductController.CreateProduct,
        schema: {
            tags: ["Admin"],
            body: Schema.BaseRequestSchema("Rakha", {
                name: { type: "string" },
                description: { type: "string" },
                price: { type: "integer" },
                stock: { type: "integer" },
            }),
            response: Schema.BaseResponse({ type: "Boolean" }),
        },
    },
    {
        method: ["POST"],
        url: "/api/v1/admin/product/delete",
        preHandler: CheckAuthAdmin({ rules: Rules.DELETE_PRODUCT }),
        handler: ProductController.DeleteProduct,
        schema: {
            tags: ["Admin"],
            body: Schema.BaseRequestSchema("Rakha", { id: { type: "integer" } }),
            response: Schema.BaseResponse({ type: "Boolean" }),
        },
    },
    {
        method: ["POST"],
        url: "/api/v1/admin/product/update",
        preHandler: CheckAuthAdmin({ rules: Rules.UPDATE_PRODUCT }),
        handler: ProductController.UpdateProduct,
        schema: {
            tags: ["Admin"],
            body: Schema.BaseRequestSchema("Rakha", {
                id: { type: "integer" },
                name: { type: "string" },
                description: { type: "string" },
                price: { type: "integer" },
                stock: { type: "integer" },
            }),
            response: Schema.BaseResponse({ type: "Boolean" }),
        },
    },
    {
        method: ["GET"],
        url: "/api/v1/admin/profile",
        handler: AdminController.GetAdminProfile,
        schema: {
            tags: ["Admin"],
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
        url: "/api/v1/admin/create-user",
        preHandler: CheckAuthAdmin({ rules: Rules.CREATE_USER }),
        handler: AdminController.CreateUser,
        schema: {
            tags: ["Admin"],
            body: Schema.BaseRequestSchema("Raihan", {
                name: { type: "string" },
                email: { type: "string" },
                password: { type: "string" },
            }),
            response: Schema.BaseResponse({
                type: "Object",
                message: {
                    id: { type: "number" },
                    name: { type: "string" },
                    email: { type: "string" },
                    level: { type: "number" },
                    created_at: { type: "number" },
                },
            }),
        },
    },
    {
        method: ["POST"],
        url: "/api/v1/admin/update-user",
        preHandler: CheckAuthAdmin({ rules: Rules.UPDATE_USER_PROFILE }),
        handler: AdminController.UpdateProfileUser,
        schema: {
            tags: ["Admin"],
            body: Schema.BaseRequestSchema("Raihan", {
                userid: { type: "number" },
                name: { type: "string" },
                email: { type: "string" },
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
        url: "/api/v1/admin/update-profile",
        handler: AdminController.UpdateProfile,
        schema: {
            tags: ["Admin"],
            body: Schema.BaseRequestSchema("Raihan", {
                name: { type: "string" },
                email: { type: "string" },
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
        url: "/api/v1/admin/delete-user",
        preHandler: CheckAuthAdmin({ rules: Rules.DELETE_USER }),
        handler: AdminController.DeleteUser,
        schema: {
            tags: ["Admin"],
            body: Schema.BaseRequestSchema("Raihan", {
                email: { type: "string" },
            }),
            response: Schema.BaseResponse({
                type: "Boolean",
            }),
        },
    },
    {
        method: ["POST"],
        url: "/api/v1/admin/user-list",
        preHandler: CheckAuthAdmin({ rules: Rules.VIEW_USER_LIST }),
        handler: AdminController.GetUserList,
        schema: {
            tags: ["Admin"],
            body: Schema.BasePaginationRequestSchema({
                pic: "Rakha",
                search: {
                    name: "string",
                    email: "string",
                    level: "number",
                    isDeleted: "number"
                }
            }),
            response: Schema.BasePaginationResultSchema
        },
    },
    {
        method: ["POST"],
        url: "/api/v1/admin/user-detail",
        preHandler: CheckAuthAdmin({ rules: Rules.VIEW_USER_PROFILE }),
        handler: AdminController.GetUserDetailProfile,
        schema: {
            tags: ["Admin"],
            body: Schema.BaseRequestSchema("Raihan", {
                email: { type: "string" },
            }),
            response: Schema.BaseResponse({
                type: "Object",
                message: {
                    id: { type: "number" },
                    email: { type: "string" },
                    name: { type: "string" },
                    created_at: { type: "number" },
                },
            }),
        },
    },
    {
        method: ["GET"],
        url: "/api/v1/admin/admin-list",
        preHandler: CheckAuthAdmin({ rules: Rules.VIEW_RULES_LIST }),
        handler: AdminController.GetAdminList,
        schema: {
            tags: ["Admin"],
            response: Schema.BaseResponse({
                type: "Array of Object",
                message: {
                    name: { type: "string" },
                    rights: { type: "array", items: { type: "string" } },
                    rules_id: { type: "array", items: { type: "integer" } },
                },
            }),
        },
    },
    {
        method: ["GET"],
        url: "/api/v1/admin/rules/list",
        preHandler: CheckAuthAdmin({ rules: Rules.VIEW_RULES_LIST }),
        handler: AdminController.GetRulesList,
        schema: {
            tags: ["Admin"],
            description: `PIC Rakha`,
            response: Schema.BaseResponse({
                type: "Array of Object",
                message: {
                    rules_id: { type: "integer" },
                    rules: { type: "string" },
                },
            }),
        },
    },
    {
        method: ["POST"],
        url: "/api/v1/admin/rules/create",
        preHandler: CheckAuthAdmin({ rules: Rules.CREATE_RULES }),
        handler: AdminController.CreateRule,
        schema: {
            tags: ["Admin"],
            body: Schema.BaseRequestSchema("Rakha", { rule: { type: "string" } }),
            response: Schema.BaseResponse({ type: "Boolean" }),
        },
    },
    {
        method: ["POST"],
        url: "/api/v1/admin/rules/update",
        preHandler: CheckAuthAdmin({ rules: Rules.UPDATE_RULES }),
        handler: AdminController.UpdateRule,
        schema: {
            tags: ["Admin"],
            body: Schema.BaseRequestSchema("Rakha", {
                rule: { type: "string" },
                rules_id: { type: "integer" },
            }),
            response: Schema.BaseResponse({ type: "Boolean" }),
        },
    },
    {
        method: ["POST"],
        url: "/api/v1/admin/rules/delete",
        preHandler: CheckAuthAdmin({ rules: Rules.DELETE_RULES }),
        handler: AdminController.DeleteRule,
        schema: {
            tags: ["Admin"],
            body: Schema.BaseRequestSchema("Rakha", {
                rules_id: { type: "integer" },
            }),
            response: Schema.BaseResponse({ type: "Boolean" }),
        },
    },
    {
        method: ["POST"],
        url: "/api/v1/admin/rules/assign",
        preHandler: CheckAuthAdmin({ rules: Rules.ASSIGN_RULES_TO_ADMIN }),
        handler: AdminController.AssignRule,
        schema: {
            tags: ["Admin"],
            body: Schema.BaseRequestSchema("Rakha", {
                group_id: { type: "integer" },
                rules_id: { type: "integer" },
            }),
            response: Schema.BaseResponse({ type: "Boolean" }),
        },
    },
    {
        method: ["POST"],
        url: "/api/v1/admin/rules/revoke",
        preHandler: CheckAuthAdmin({ rules: Rules.REVOKE_RULES_FROM_ADMIN }),
        handler: AdminController.RevokeRule,
        schema: {
            tags: ["Admin"],
            body: Schema.BaseRequestSchema("Rakha", {
                group_id: { type: "integer" },
                rules_id: { type: "integer" },
            }),
            response: Schema.BaseResponse({ type: "Boolean" }),
        },
    },
    {
        method: ["POST"],
        url: "/api/v1/admin/change-user-pass",
        preHandler: CheckAuthAdmin({ rules: Rules.CHANGE_USER_PASSWORD }),
        handler: AdminController.ChangeUserPass,
        schema: {
            tags: ["Admin"],
            body: Schema.BaseRequestSchema("Raihan", {
                userid: { type: "number" },
                password: { type: "string" },
                confirmPassword: { type: "string" },
            }),
            response: Schema.BaseResponse({
                type: "Boolean",
            }),
        },
    },
    {
        method: ["POST"],
        url: "/api/v1/admin/change-pass",
        handler: AdminController.ChangePass,
        schema: {
            tags: ["Admin"],
            body: Schema.BaseRequestSchema("Raihan", {
                oldPassword: { type: "string" },
                newPassword: { type: "string" },
            }),
            response: Schema.BaseResponse({
                type: "Boolean",
            }),
        },
    },
    {
        method: ["POST"],
        url: "/api/v1/admin/transaction/list",
        preHandler: CheckAuthAdmin({ rules: Rules.VIEW_TRANSACTION_LIST }),
        handler: AdminController.GetTransactionList,
        schema: {
            tags: ["Admin"],
            body: Schema.BasePaginationRequestSchema({
                pic: "Rakha",
                search: {
                    payment: "string",
                    shipped_to: "number",
                    items_price: "number",
                    total_price: "number",
                    created: "number",
                    isDeleted: "number",
                },
            }),
            response: Schema.BasePaginationResultSchema,

        },
    },
    {
        method: ["POST"],
        url: "/api/v1/admin/user/transaction/list",
        preHandler: CheckAuthAdmin({ rules: Rules.VIEW_USER_TRANSACTION_LIST }),
        handler: AdminController.GetUserTransactionListById,
        schema: {
            body: Schema.BasePaginationRequestSchema({
                pic: "Rakha",
                search: {
                    payment: "string",
                    shipped_to: "number",
                    items_price: "number",
                    total_price: "number",
                    created: "number",
                    isDeleted: "number",
                },
                additional_body: {
                    user_id: { type: "number" },
                },
            }),
            response: Schema.BasePaginationResultSchema,
        },
    },
    {
        method: ["POST"],
        url: "/api/v1/admin/transaction/update-delivery-status",
        preHandler: CheckAuthAdmin({ rules: Rules.UPDATE_TRANSACTION_DELIVERY_STATUS }),
        handler: AdminController.UpdateDeliveryStatus,
        schema: {
            tags: ["Admin"],
            body: Schema.BaseRequestSchema("Rakha", {
                transaction_id: { type: "number" },
                is_delivered: { type: "number" },
                status: { type: "number" },
            }),
            response: Schema.BaseResponse({ type: "Boolean" }),
        },
    },
    {
        method: ["POST"],
        url: "/api/v1/admin/user/shipping-address",
        preHandler: CheckAuthAdmin({ rules: Rules.VIEW_USER_SHIPPING_ADDRESS }),
        handler: AdminController.GetUserShippingAddress,
        schema: {
            tags: ["Admin"],
            body: Schema.BasePaginationRequestSchema({
                pic: "Raihan",
                search: {
                    id: "number",
                    user_id: "number",
                    city: "string"
                }
            }),
            response: Schema.BasePaginationResultSchema,
        },
    },
    {
        method: ["POST"],
        url: "/api/v1/admin/user/transaction/approve",
        preHandler: CheckAuthAdmin({ rules: Rules.APPROVE_TRANSACTION }),
        handler: AdminController.ApproveTransaction,
        schema: {
            tags: ["Admin"],
            body: Schema.BaseRequestSchema("Rakha", {
                transaction_id: { type: "number" },
            }),
            response: Schema.BaseResponse({ type: "Boolean" }),
        },
    },
    {
        method: ["POST"],
        url: "/api/v1/admin/user/shipping-address/list",
        preHandler: CheckAuthAdmin({ rules: Rules.VIEW_USER_SHIPPING_ADDRESS_LIST }),
        handler: AdminController.GetUserShippingAddressById,
        schema: {
            tags: ["Admin"],
            body: Schema.BasePaginationRequestSchema({
                pic: "Raihan",
                search: {
                    id: "number",
                    city: "string"
                }
            }),
            response: Schema.BasePaginationResultSchema,
        },
    },
    {
        method: ["POST"],
        url: "/api/v1/admin/user/transaction/reject",
        preHandler: CheckAuthAdmin({ rules: Rules.REJECT_TRANSACTION }),
        handler: AdminController.RejectTransaction,
        schema: {
            tags: ["Admin"],
            body: Schema.BaseRequestSchema("Rakha", {
                transaction_id: { type: "number" },
            }),
            response: Schema.BaseResponse({ type: "Boolean" }),
        },
    },
    {
        method: ["POST"],
        url: "/api/v1/admin/user/transaction/detail",
        preHandler: CheckAuthAdmin({ rules: Rules.VIEW_USER_TRANSACTION_DETAIL }),
        handler: AdminController.GetUserTransactionDetail,
        schema: {
            tags: ["Admin"],
            body: Schema.BaseRequestSchema("Raihan", { id: { type: "number" } }),
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
                },
            }),
        },
    },
    {
        method: ["POST"],
        url: "/api/v1/admin/update-user-level",
        preHandler: CheckAuthAdmin({ rules: Rules.UPDATE_USER_LEVEL }),
        handler: AdminController.UpdateUserLevel,
        schema: {
            tags: ["Admin"],
            body: Schema.BaseRequestSchema("Raihan", {
                user_id: { type: "number" },
                level: { type: "number" },
            }),
            response: Schema.BaseResponse({
                type: "Boolean",
            }),
        },
    },
    {
        method: ["POST"],
        url: "/api/v1/admin/transaction/delete",
        preHandler: CheckAuthAdmin({ rules: Rules.DELETE_TRANSACTION }),
        handler: AdminController.DeleteUserTransaction,
        schema: {
            tags: ["Admin"],
            body: Schema.BaseRequestSchema("Raihan", { transaction_id: { type: "number" } }),
            response: Schema.BaseResponse({ type: "Boolean" }),
        },
    },
    {
        method: ["POST"],
        url: "/api/v1/admin/log/list",
        preHandler: CheckAuthAdmin({ rules: Rules.VIEW_SYSTEM_LOG }),
        handler: LogController.GetSystemLog,
        schema: {
            body: Schema.BasePaginationRequestSchema({
                pic: "Rakha",
                search: {
                    user_id: "number",
                    name: "string",
                    time: "number",
                    action: "string",
                },
            }),
            response: Schema.BasePaginationResultSchema,
        },
    },
    {
        method: ["POST"],
        url: "/api/v1/admin/restore-deleted-user",
        preHandler: CheckAuthAdmin({ rules: Rules.RESTORE_DELETED_USER }),
        handler: AdminController.RestoreDeletedUser,
        schema: {
            body: Schema.BaseRequestSchema("Rakha",{
                user_id: { type: "number" }
            }),
            response: Schema.BaseResponse({
                type: "Boolean"
            }),
        },
    },
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