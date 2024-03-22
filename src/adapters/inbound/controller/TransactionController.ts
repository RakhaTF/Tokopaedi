import { FastifyRequest } from "fastify"
import TransactionAppService from "@application/service/Transaction"
import { TransactionRequestDto } from "@domain/model/request"
import moment from "moment"

export default class TransactionController {
    static async CreateTransaction(request: FastifyRequest) {
        const { id } = request.user
        const { product_id, qty } = request.body as TransactionRequestDto.CreateTransactionRequest
        const createTransaction = await TransactionAppService.CreateTransactionService(
            {
                id,
                product_id,
                qty,
                created_at: moment().unix(),
                updated_at: moment().unix(),
            },
            {
                user_id: id,
                action: "Create Transaction",
                ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
                browser: request.headers["user-agent"],
                time: moment().unix(),
            }
        )

        const result = { message: createTransaction }

        return result
    }

    static async UpdateTransactionProductQty(request: FastifyRequest) {
        const { id } = request.user
        const { product_id, order_id, qty } = request.body as TransactionRequestDto.UpdateTransactionRequest
        const updateTransaction = await TransactionAppService.UpdateTransactionProductQtyService(
            {
                id,
                order_id,
                product_id,
                qty,
                updated_at: moment().unix(),
            },
            {
                user_id: id,
                action: `Update Transaction #${order_id} Product #${product_id} Qty: #${qty}`,
                ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
                browser: request.headers["user-agent"],
                time: moment().unix(),
            }
        )

        const result = { message: updateTransaction }

        return result
    }

    static async PayTransaction(request: FastifyRequest) {
        const { id } = request.user
        const requestBody = request.body as TransactionRequestDto.PayTransactionRequest
        const payTransaction = await TransactionAppService.PayTransaction(
            { ...requestBody, user_id: id },
            {
                user_id: id,
                action: `Pay Transaction #${requestBody.transaction_id}`,
                ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
                browser: request.headers["user-agent"],
                time: moment().unix(),
            }
        )
        return { message: payTransaction }
    }

    static async TransactionDetail(request: FastifyRequest) {
        const { id } = request.body as { id: number }
        const transactionDetail = await TransactionAppService.GetTransactionDetail(id)
        return { message: transactionDetail }
    }

    static async MidtransNotification(request: FastifyRequest) {
        const notification = request.body as object
        await TransactionAppService.MidtransNotificationHandler(notification)
    }
}
