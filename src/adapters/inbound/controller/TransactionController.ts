import { FastifyRequest } from "fastify";
import TransactionAppService from "@application/service/Transaction";
import { TransactionRequestDto } from "@domain/model/request";
import moment from "moment";

export default class TransactionController {
    static async CreateTransaction(request: FastifyRequest){
        try {
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
        } catch (error) {
            throw error
        }
    }

    static async UpdateTransactionProductQty(request: FastifyRequest){
        try {
            const { id } = request.user
            const { product_id, order_id, qty } = request.body as TransactionRequestDto.UpdateTransactionRequest
            const updateTransaction = await TransactionAppService.UpdateTransactionProductQtyService({
                id,
                order_id,
                product_id,
                qty,
                updated_at: moment().unix()
            },
            {
                user_id: id,
                action: `Update Transaction #${order_id} Product #${product_id} Qty: ${qty}`,
                ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
                browser: request.headers["user-agent"],
                time: moment().unix(),
            })

            const result = {message: updateTransaction}

            return result
        } catch (error) {
            throw error
        }
    }

    static async PayTransaction(request: FastifyRequest) {
        try {
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
        } catch (error) {
            throw error
        }
    }

    static async TransactionDetail(request: FastifyRequest) {
        try {
            const { id } = request.body as { id: number }
            const transactionDetail = await TransactionAppService.GetTransactionDetail(id)
            return { message: transactionDetail }
        } catch (error) {
            throw error
        }
    }
}