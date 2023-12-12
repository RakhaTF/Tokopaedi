import { TransactionParamsDto } from "@domain/model/params";
import * as TransactionSchema from "helpers/JoiSchema/Transaction"
import TransactionDomainService from "@domain/service/TransactionDomainService";
import { AppDataSource } from "@infrastructure/mysql/connection";

export default class TransactionAppService {
    static async CreateTransactionService(params: TransactionParamsDto.CreateTransactionParams){
        if (params.product_id.length != params.qty.length){
            throw new Error ("Product_id and qty not match")
        }

        await TransactionSchema.CreateTransaction.validateAsync(params)

        const db = AppDataSource;
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            const {insertId} = await TransactionDomainService.CreateTransactionIdDomain(params, query_runner);

            let insertOrderObj = {
                insertId,
                product_id: params.product_id,
                qty: params.qty,

            }

            await TransactionDomainService.InsertOrderItemDomain(insertOrderObj, query_runner)

            const getOrderItem = await TransactionDomainService.GetOrderItemByOrderIdDomain(insertId, query_runner)

            await query_runner.commitTransaction();
            await query_runner.release();

            return getOrderItem
        } catch (error) {
            await query_runner.rollbackTransaction();
            await query_runner.release();
            throw error
        }
    }

    static async UpdateTransactionService(params: TransactionParamsDto.UpdateTransactionParams){
        if (params.product_id.length != params.qty.length){
            throw new Error ("Product_id and qty not match")
        }

        await TransactionSchema.UpdateTransactionService.validateAsync(params)

        if (params.id < 1){
            throw new Error ("User not found")
        }

        let updateOrderObj = {
            order_id: params.order_id,
            product_id: params.product_id,
            qty: params.qty
        }

        await TransactionDomainService.UpdateOrderDomain(updateOrderObj)

        await TransactionDomainService.UpdateUpdatedAtTransactionDomain({order_id: params.order_id, updated_at: params.updated_at})

        return true
    }
}