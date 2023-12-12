import TransactionRepository from "@adapters/outbound/repository/TransactionRepository"
import { QueryRunner } from "typeorm"
import { TransactionParamsDto } from "@domain/model/params";

export default class TransactionDomainService {
    static async CreateTransactionIdDomain(params: TransactionParamsDto.CreateTransactionIdParams, query_runner?: QueryRunner){
        const result = await TransactionRepository.DBCreateTransactionId(params, query_runner)

        return result
    }

    static async InsertOrderItemDomain(params: TransactionParamsDto.InsertOrderItemParams, query_runner?: QueryRunner){

        //mapping product_id to handle multiple products.
        const products = params.product_id.map((id, index) => {
            return { product_id: id, qty: params.qty[index] };
        });
        const valueProduct = products.map(product => `(${params.insertId}, ${product.product_id}, ${product.qty})`).join(', ')
        const result = await TransactionRepository.DBInsertOrderItem(valueProduct, query_runner)
        
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

    static async CreateTransactionStatusDomain(params: { transaction_id: number, update_time: number }, query_runner: QueryRunner) {
        return await TransactionRepository.DBCreateTransactionStatus(params, query_runner)
    }

    static async GetTransactionDetailDomain(id: number) {
        const test =  await TransactionRepository.DBGetTransactionDetail(id)
        console.log({test})
        return test
    }

    static async UpdateTransactionProductQtyDomain(params: TransactionParamsDto.UpdateTransactionProductQty){
        const result = await TransactionRepository.DBUpdateTransactionProductQty(params)

        if (result.affectedRows < 1){
            throw Error ("Failed update updated_at in transaction")
        }

        return true
    }

    static async PayTransactionDomain(params: TransactionParamsDto.PayTransactionParams) {
        const paymentResult = await TransactionRepository.DBPayTransaction(params)
        if(paymentResult.affectedRows < 1) {
            throw Error("Failed to Pay Transaction")
        }
    }

    static async GetPendingTransactionDomain(user_id: number) {
        return await TransactionRepository.DBGetPendingTransaction(user_id)
    }
}