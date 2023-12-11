import TransactionRepository from "@adapters/outbound/repository/TransactionRepository"
import { QueryRunner } from "typeorm"

export default class TransactionDomainService {
    static async CreateTransactionIdDomain(id: number, query_runner?: QueryRunner){
        const result = await TransactionRepository.DBCreateTransactionId(id, query_runner)

        return result
    }

    static async InsertOrderItemDomain(insertId: number, product_id: number, qty: number, query_runner?: QueryRunner){
        const result = await TransactionRepository.DBInsertOrderItem(insertId, product_id, qty, query_runner)
        if (result.affectedRows < 1){
            throw new Error ("Failed insert order")
        }
        return result
    }

    static async GetUserOrderDomain(insertId: number, query_runner?: QueryRunner) {
        const result = await TransactionRepository.DBGetUserOrderDomain(insertId, query_runner)
        return result
    }
}