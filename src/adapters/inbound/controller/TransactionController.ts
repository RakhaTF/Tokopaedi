import { FastifyRequest } from "fastify";
import TransactionAppService from "@application/service/Transaction";
import { TransactionRequestDto } from "@domain/model/request";

export default class TransactionController {
    static async CreateTransaction(request: FastifyRequest){
        try {
            const jwt = request.user
            const { product_id, qty } = request.body as TransactionRequestDto.CreateTransactionRequest
            const createTransaction = await TransactionAppService.CreateTransactionService({
                id: jwt.id,
                product_id,
                qty
            })

            const result = {message: createTransaction}

            return result
        } catch (error) {
            throw error
        }
    }
}