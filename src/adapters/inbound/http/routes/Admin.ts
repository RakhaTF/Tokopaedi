import { FastifyInstance, FastifyPluginOptions, RouteOptions } from "fastify"
import ProductController from "@adapters/inbound/controller/ProductController"
import { AuthValidate, CheckAuthAdmin } from "@helpers/prehandler/AuthValidate"
import { Rules } from "@domain/model/Rules"
import * as Schema from "@helpers/ApiSchema/ApiSchema"
import AdminController from "@adapters/inbound/controller/AdminController"
import LogController from "@adapters/inbound/controller/LogController"
import fastifyMulter from "fastify-multer"
import moment from "moment"
import path from "path"
import { fileFilter } from "@helpers/utils/image/imageHelper"

const multer = fastifyMulter
const storage = multer.diskStorage({
    destination: path.resolve(__dirname, "../../../../uploads/"),
    filename: (_req, file, cb) => {
        // Format the current date and time as a string in the desired format
        // For example, 'YYYYMMDDHHmmss' will format the date as '20230415123045' for April 15, 2023, at 12:30:45
        const dateNow = moment().format("YYYYMMDDHHmmss")
        const filename = `${dateNow}-${file.originalname.trim()}`
        cb(null, filename)
    },
})

//limit file size to 2MB
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 }, fileFilter: fileFilter })
const routes: RouteOptions[] = [
    {
        method: ["POST"],
        url: "product/create",
        preHandler: CheckAuthAdmin({ rules: Rules.CREATE_PRODUCT }),
        handler: ProductController.CreateProduct,
        preValidation: [
            upload.fields([
                { name: "thumbnailImage", maxCount: 1 },
                { name: "secondImage", maxCount: 1 },
                { name: "thirdImage", maxCount: 1 },
                { name: "fourthImage", maxCount: 1 },
                { name: "fifthImage", maxCount: 1 },
            ]),
        ],
        schema: {
            tags: ["Admin"],
            consumes: ["multipart/form-data"],
            body: Schema.BaseRequestSchema("Rakha", {
                name: { type: "string" },
                description: { type: "string" },
                category: { type: "integer" },
                price: { type: "integer" },
                stock: { type: "integer" },
                thumbnailImage: { type: "file" },
                secondimage: { type: "file" },
                thirdImage: { type: "file" },
                fourthImage: { type: "file" },
                fifthImage: { type: "file" },
            }),
            response: Schema.BaseResponse({ type: "Boolean" }),
        },
    },
    {
        method: ["POST"],
        url: "product/delete",
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
        url: "product/update",
        preHandler: CheckAuthAdmin({ rules: Rules.UPDATE_PRODUCT }),
        handler: ProductController.UpdateProduct,
        schema: {
            tags: ["Admin"],
            consumes: ["multipart/form-data"],
            body: Schema.BaseRequestSchema("Rakha", {
                id: { type: "integer" },
                name: { type: "string" },
                description: { type: "string" },
                category: { type: "integer" },
                price: { type: "integer" },
                stock: { type: "integer" },
            }),
            response: Schema.BaseResponse({ type: "Boolean" }),
        },
    },
    {
        method: ["GET"],
        url: "profile",
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
        url: "create-user",
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
        url: "update-user",
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
        url: "update-profile",
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
        url: "delete-user",
        preHandler: CheckAuthAdmin({ rules: Rules.DELETE_USER }),
        handler: AdminController.SoftDeleteUser,
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
        url: "user-list",
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
                    isDeleted: "number",
                },
            }),
            response: Schema.BasePaginationResultSchema,
        },
    },
    {
        method: ["POST"],
        url: "user-detail",
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
        url: "admin-list",
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
        url: "rules/list",
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
        url: "rules/create",
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
        url: "rules/update",
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
        url: "rules/delete",
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
        url: "rules/assign",
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
        url: "rules/revoke",
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
        url: "change-user-pass",
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
        url: "change-pass",
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
        url: "transaction/list",
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
        url: "user/transaction/list",
        preHandler: CheckAuthAdmin({ rules: Rules.VIEW_USER_TRANSACTION_LIST }),
        handler: AdminController.GetUserTransactionListById,
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
                additional_body: {
                    user_id: { type: "number" },
                },
            }),
            response: Schema.BasePaginationResultSchema,
        },
    },
    {
        method: ["POST"],
        url: "transaction/update-delivery-status",
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
        url: "user/shipping-address",
        preHandler: CheckAuthAdmin({ rules: Rules.VIEW_USER_SHIPPING_ADDRESS }),
        handler: AdminController.GetUserShippingAddress,
        schema: {
            tags: ["Admin"],
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
        url: "user/transaction/approve",
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
        url: "user/shipping-address/list",
        preHandler: CheckAuthAdmin({ rules: Rules.VIEW_USER_SHIPPING_ADDRESS_LIST }),
        handler: AdminController.GetUserShippingAddressById,
        schema: {
            tags: ["Admin"],
            body: Schema.BasePaginationRequestSchema({
                pic: "Raihan",
                search: {
                    id: "number",
                    city: "string",
                },
            }),
            response: Schema.BasePaginationResultSchema,
        },
    },
    {
        method: ["POST"],
        url: "user/transaction/reject",
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
        url: "user/transaction/detail",
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
                    expire_at: { type: "string" },
                },
            }),
        },
    },
    {
        method: ["POST"],
        url: "update-user-level",
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
        url: "transaction/delete",
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
        url: "log/list",
        preHandler: CheckAuthAdmin({ rules: Rules.VIEW_SYSTEM_LOG }),
        handler: LogController.GetSystemLog,
        schema: {
            tags: ["Admin"],
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
        url: "restore-deleted-user",
        preHandler: CheckAuthAdmin({ rules: Rules.RESTORE_DELETED_USER }),
        handler: AdminController.RestoreDeletedUser,
        schema: {
            tags: ["Admin"],
            body: Schema.BaseRequestSchema("Rakha", {
                user_id: { type: "number" },
            }),
            response: Schema.BaseResponse({
                type: "Boolean",
            }),
        },
    },
    {
        method: ["POST"],
        url: "category/create",
        preHandler: CheckAuthAdmin({ rules: Rules.CREATE_PRODUCT_CATEGORY }),
        handler: ProductController.CreateCategory,
        schema: {
            tags: ["Admin"],
            body: Schema.BaseRequestSchema("Rakha", {
                name: { type: "string" },
                parent_id: { type: "number" },
            }),
            response: Schema.BaseResponse({
                type: "Boolean",
            }),
        },
    },
    {
        method: ["POST"],
        url: "category/update",
        preHandler: CheckAuthAdmin({ rules: Rules.UPDATE_PRODUCT_CATEGORY }),
        handler: ProductController.UpdateCategory,
        schema: {
            tags: ["Admin"],
            body: Schema.BaseRequestSchema("Rakha", {
                id: { type: "number" },
                name: { type: "string" },
                parent_id: { type: "number" },
            }),
            response: Schema.BaseResponse({
                type: "Boolean",
            }),
        },
    },
    {
        method: ["POST"],
        url: "category/delete",
        preHandler: CheckAuthAdmin({ rules: Rules.DELETE_PRODUCT_CATEGORY }),
        handler: ProductController.DeleteCategory,
        schema: {
            tags: ["Admin"],
            body: Schema.BaseRequestSchema("Rakha", { id: { type: "number" } }),
            response: Schema.BaseResponse({
                type: "Boolean",
            }),
        },
    },
    {
        method: ["POST"],
        url: "product/gallery/update",
        preHandler: CheckAuthAdmin({ rules: Rules.UPDATE_PRODUCT }),
        handler: ProductController.UpdateImageGallery,
        preValidation: [
            upload.fields([
                { name: "thumbnailImage", maxCount: 1 },
                { name: "secondImage", maxCount: 1 },
                { name: "thirdImage", maxCount: 1 },
                { name: "fourthImage", maxCount: 1 },
                { name: "fifthImage", maxCount: 1 },
            ]),
        ],
        schema: {
            tags: ["Admin"],
            consumes: ["multipart/form-data"],
            body: Schema.BaseRequestSchema("Rakha", {
                product_id: { type: "integer" },
                public_id: { type: "string" },
                img_src: { type: "string" },
                thumbnail: { type: "number" },
                display_order: { type: "number" },
                thumbnailImage: { type: "file" },
                secondimage: { type: "file" },
                thirdImage: { type: "file" },
                fourthImage: { type: "file" },
                fifthImage: { type: "file" },
            }),
            response: Schema.BaseResponse({ type: "Boolean" }),
        },
    },
    {
        method: ["POST"],
        url: "product/gallery/add",
        preHandler: CheckAuthAdmin({ rules: Rules.UPDATE_PRODUCT }),
        handler: ProductController.AddImageGallery,
        preValidation: [
            upload.fields([
                { name: "thumbnailImage", maxCount: 1 },
                { name: "secondImage", maxCount: 1 },
                { name: "thirdImage", maxCount: 1 },
                { name: "fourthImage", maxCount: 1 },
                { name: "fifthImage", maxCount: 1 },
            ]),
        ],
        schema: {
            tags: ["Admin"],
            consumes: ["multipart/form-data"],
            body: Schema.BaseRequestSchema("Rakha", {
                product_id: { type: "integer" },
                display_order: { type: "number" },
                thumbnailImage: { type: "file" },
                secondimage: { type: "file" },
                thirdImage: { type: "file" },
                fourthImage: { type: "file" },
                fifthImage: { type: "file" },
            }),
            response: Schema.BaseResponse({ type: "Boolean" }),
        },
    },
    {
        method: ["POST"],
        url: "product/gallery/delete",
        preHandler: CheckAuthAdmin({ rules: Rules.UPDATE_PRODUCT }),
        handler: ProductController.DeleteImageGallery,
        schema: {
            tags: ["Admin"],
            consumes: ["multipart/form-data"],
            body: Schema.BaseRequestSchema("Rakha", {
                product_id: { type: "integer" },
                public_id: { type: "string" },
            }),
            response: Schema.BaseResponse({ type: "Boolean" }),
        },
    },
    {
        method: ["POST"],
        url: "product/hard-delete",
        preHandler: CheckAuthAdmin({ rules: Rules.DELETE_PRODUCT }),
        handler: ProductController.HardDeleteProduct,
        schema: {
            tags: ["Admin"],
            body: Schema.BaseRequestSchema("Rakha", { id: { type: "integer" } }),
            response: Schema.BaseResponse({ type: "Boolean" }),
        },
    },
]

export default async function AdminRoute(fastify: FastifyInstance, options: FastifyPluginOptions) {
    fastify.addHook("preValidation", AuthValidate)
    for (const route of routes) {
        fastify.route({ ...route, config: options })
    }
}
