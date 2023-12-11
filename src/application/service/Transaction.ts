import { TransactionParamsDto } from "@domain/model/params";
// import * as TransactionSchema from "helpers/JoiSchema/Transaction"
import TransactionDomainService from "@domain/service/TransactionDomainService";
import { AppDataSource } from "@infrastructure/mysql/connection";

export default class TransactionAppService {
    static async CreateTransactionService(params: TransactionParamsDto.CreateTransactionParams){
        // await TransactionSchema.CreateTransaction.validateAsync(params)

        const db = AppDataSource;
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            const {insertId} = await TransactionDomainService.CreateTransactionIdDomain(params.id, query_runner);

            await TransactionDomainService.InsertOrderItemDomain(insertId, params.product_id, params.qty, query_runner)

            await query_runner.commitTransaction();
            await query_runner.release();

            return insertId
        } catch (error) {
            await query_runner.rollbackTransaction();
            await query_runner.release();
            throw error
        }
    }
}