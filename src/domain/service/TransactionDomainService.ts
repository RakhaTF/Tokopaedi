import TransactionRepository from "@adapters/outbound/repository/TransactionRepository"
import { QueryRunner } from "typeorm"
import { TransactionParamsDto } from "@domain/model/params"
import { RepoPaginationParams } from "key-pagination-sql"

export default class TransactionDomainService {
    static async CreateTransactionIdDomain(params: TransactionParamsDto.CreateTransactionIdParams, query_runner?: QueryRunner) {
        const result = await TransactionRepository.DBCreateTransactionId(params, query_runner)

        return result
    }

    static async InsertOrderItemDomain(params: TransactionParamsDto.InsertOrderItemParams, query_runner?: QueryRunner) {
        //mapping product_id to handle multiple products.
        const products = params.product_id.map((id, index) => {
            return { product_id: id, qty: params.qty[index] }
        })
        const valueProduct = products.map((product) => `(${params.insertId}, ${product.product_id}, ${product.qty})`).join(", ")
        const result = await TransactionRepository.DBInsertOrderItem(valueProduct, query_runner)

        if (result.affectedRows < 1) {
            throw new Error("Failed insert order")
        }
        return result
    }

    static async GetOrderItemByOrderIdDomain(insertId: number, query_runner?: QueryRunner) {
        return await TransactionRepository.DBGetOrderItemByOrderId(insertId, query_runner)
    }

    static async UpdateOrderDomain(params: TransactionParamsDto.UpdateOrderParams, query_runner: QueryRunner) {
        const result = await TransactionRepository.DBUpdateOrder(params, query_runner)

        if (result.affectedRows < 1) {
            throw Error("Failed update product qty")
        }

        return true
    }

    static async CreateTransactionStatusDomain(params: { transaction_id: number; update_time: number }, query_runner: QueryRunner) {
        return await TransactionRepository.DBCreateTransactionStatus(params, query_runner)
    }

    static async GetCurrentTransactionDetailDomain(id: number) {
        const transactionDetail = await TransactionRepository.DBGetCurrentTransactionDetail(id)
        if (transactionDetail.length < 1) {
            throw new Error("Transaction not found!")
        }
        return transactionDetail
    }

    static async UpdateTransactionProductQtyDomain(params: TransactionParamsDto.UpdateTransactionProductQty, query_runner: QueryRunner) {
        const result = await TransactionRepository.DBUpdateTransactionProductQty(params, query_runner)

        if (result.affectedRows < 1) {
            throw Error("Failed update updated_at in transaction")
        }

        return true
    }

    static async PayTransactionDomain(params: TransactionParamsDto.PayTransactionRepositoryParams, query_runner: QueryRunner) {
        const paymentResult = await TransactionRepository.DBPayTransaction(params, query_runner)
        if (paymentResult.affectedRows < 1) {
            throw Error("Failed to Pay Transaction")
        }
    }

    static async GetPendingTransactionDomain(user_id: number) {
        return await TransactionRepository.DBGetPendingTransaction(user_id)
    }

    static async CreateDeliveryStatusDomain(params: TransactionParamsDto.CreateDeliveryStatusParams, query_runner: QueryRunner) {
        const deliveryStatus = await TransactionRepository.DBCreateDeliveryStatus(params, query_runner)
        if (deliveryStatus.affectedRows < 1) {
            throw new Error("Failed to create delivery_status")
        }
    }

    static async GetTransactionDetailDomain(id: number) {
        const transactionDetail = await TransactionRepository.DBGetTransactionDetail(id)
        if (transactionDetail.length < 1) {
            throw new Error("Transaction not found!")
        }
        return transactionDetail[0]
    }

    static async GetUserTransactionListByIdDomain(userid: number, paginationParams: RepoPaginationParams) {
        const transactionList = await TransactionRepository.DBGetUserTransactionListById(userid, paginationParams)
        if (transactionList.length < 1) {
            throw new Error("No Transaction Found")
        }
        return transactionList
    }

    static async UpdateDeliveryStatusDomain(params: TransactionParamsDto.UpdateDeliveryStatusParams, query_runner: QueryRunner) {
        const updateDeliveryStatusDomain = await TransactionRepository.DBUpdateDeliveryStatus(params, query_runner)
        if (updateDeliveryStatusDomain.affectedRows < 1) {
            throw new Error("Failed to update delivery status")
        }
    }

    static async UpdateTransactionStatusDomain(params: TransactionParamsDto.UpdateTransactionStatusParams, query_runner: QueryRunner) {
        const updateTransactionStatus = await TransactionRepository.DBUpateTransactionStatus(params, query_runner)
        if (updateTransactionStatus.affectedRows < 1) {
            throw new Error("Failed to update transaction status")
        }
    }

    static async GetTransactionStatusDomain(transaction_id: number) {
        const transactionStatus = await TransactionRepository.DBGetTransactionStatus(transaction_id)
        if (transactionStatus.length < 1) {
            throw new Error("Transaction not found")
        }
        return transactionStatus[0]
    }

    static async SoftDeleteTransactionDomain(transaction_id: number, query_runner?: QueryRunner) {
        const deleteTransaction = await TransactionRepository.DBSoftDeleteTransaction(transaction_id, query_runner)
        if (deleteTransaction.affectedRows < 1) {
            throw new Error("Failed to delete transaction!")
        }
    }

    static async GetAllPendingTransactionDomain() {
        return await TransactionRepository.DBGetAllPendingTransaction()
    }

    static async CheckIsTransactionAliveDomain(id: number) {
        const isAlive = await TransactionRepository.DBCheckIsTransactionAlive(id)
        if (isAlive.length < 1) {
            throw new Error("Transaction is deleted")
        }
        return true
    }
}
