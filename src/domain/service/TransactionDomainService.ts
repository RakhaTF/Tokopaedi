import TransactionRepository from "@adapters/outbound/repository/TransactionRepository"
import { QueryRunner } from "typeorm"
import { TransactionParamsDto } from "@domain/model/params";

export default class TransactionDomainService {
    static async CreateTransactionIdDomain(id: number, query_runner?: QueryRunner){
        const result = await TransactionRepository.DBCreateTransactionId(id, query_runner)

        return result
    }

    static async InsertOrderItemDomain(params: TransactionParamsDto.InsertOrderItemParams, query_runner?: QueryRunner){
        const result = await TransactionRepository.DBInsertOrderItem(params, query_runner)
        if (result.affectedRows < 1){
            throw new Error ("Failed insert order")
        }
        return result
    }

    static async GetOrderItemByOrderIdDomain(insertId: number, query_runner?: QueryRunner){
        return await TransactionRepository.DBGetOrderItemByOrderId(insertId, query_runner)
    }

    static async UpdateOrderDomain(params: TransactionParamsDto.UpdateOrderParams){
        const result = await TransactionRepository.DBUpdateOrder(params)

        if (result.affectedRows < 1){
            throw Error ("Failed update product qty")
        }

        return true 
    }
}