import { FastifyRequest } from "fastify";
import TransactionAppService from "@application/service/Transaction";
import { TransactionRequestDto } from "@domain/model/request";
import moment from "moment";

export default class TransactionController {
    static async CreateTransaction(request: FastifyRequest){
        try {
            const jwt = request.user
            const { product_id, qty } = request.body as TransactionRequestDto.CreateTransactionRequest
            const createTransaction = await TransactionAppService.CreateTransactionService({
                id: jwt.id,
                product_id,
                qty,
                created_at: moment().unix(),
                updated_at: moment().unix()
            })

            const result = {message: createTransaction}

            return result
        } catch (error) {
            throw error
        }
    }

    static async UpdateTransaction(request: FastifyRequest){
        try {
            const jwt = request.user
            const { product_id, order_id, qty } = request.body as TransactionRequestDto.UpdateTransactionRequest
            const updateTransaction = await TransactionAppService.UpdateTransactionService({
                id: jwt.id,
                order_id,
                product_id,
                qty,
                updated_at: moment().unix()
            })

            const result = {message: updateTransaction}

            return result
        } catch (error) {
            throw error
        }
    }
}