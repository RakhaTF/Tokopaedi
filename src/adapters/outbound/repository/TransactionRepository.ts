import { AppDataSource } from "@infrastructure/mysql/connection";
import { TransactionResponseDto } from "@domain/model/response";
import { TransactionParamsDto } from "@domain/model/params";
import { QueryRunner } from "typeorm";
import { ResultSetHeader } from "mysql2"
const db = AppDataSource

export default class TransactionRepository {
    static async DBCreateTransactionId(params: TransactionParamsDto.CreateTransactionIdParams, query_runner?: QueryRunner){
        if(query_runner && !query_runner.isTransactionActive){
            throw new Error("Must in Transaction")
        }

        const result = await db.query(`INSERT INTO transaction (user_id, items_price, created_at, updated_at) VALUES (?,?,?,?)`, [params.id, params.items_price, params.created_at, params.updated_at], query_runner)
        return result
    }

    static async DBInsertOrderItem(valueProduct: TransactionParamsDto.InsertOrderItemRepositoryParams, query_runner?: QueryRunner){
        if(query_runner && !query_runner.isTransactionActive){
            throw new Error("Must in Transaction")
        }

        const result = await db.query(`INSERT INTO order_item (order_id, product_id, qty) VALUES ${valueProduct}`, [], query_runner)

        return result
    }

    static async DBGetOrderItemByOrderId(insertId: number, query_runner?: QueryRunner): Promise<TransactionResponseDto.GetOrderItemByOrderIdResponse[]>{
        if(query_runner && !query_runner.isTransactionActive){
            throw new Error("Must in Transaction")
        }

        const result = await db.query<TransactionResponseDto.GetOrderItemByOrderIdResponse[]>(`
        SELECT a.order_id, a.product_id, a.qty FROM order_item a WHERE a.order_id = ?`,
        [insertId], query_runner)

        return result
    }

    static async DBGetTransactionDetail(id: number, query_runner?: QueryRunner) {
        if (query_runner && !query_runner.isTransactionActive) {
            throw new Error("Must in Transaction")
        }

        return await db.query(`
        SELECT 
            t.id,
	        t.user_id,
	        t.payment_method,
	        t.items_price,
	        t.shipping_price,
	        t.is_paid,
	        t.paid_at,
	        t.created_at,
	        t.updated_at,
            o.product_id,
            o.qty
        FROM TRANSACTION t
        JOIN order_item o
            ON t.id = o.order_id
        WHERE t.id = ?
        `, [id])

    }

    static async DBUpdateOrder(params: TransactionParamsDto.UpdateOrderParams){
        const result = await db.query(`UPDATE order_item SET qty = ? WHERE order_id = ? AND product_id = ?`, [params.qty, params.order_id, params.product_id])
        return result
    }

    static async DBUpdateTransactionProductQty(params: TransactionParamsDto.UpdateTransactionProductQty){
        const result = await db.query(`UPDATE transaction SET updated_at = ? WHERE id = ?`, [params.updated_at, params.order_id])
        return result
    }

    static async DBCreateTransactionStatus({ transaction_id, update_time }: { transaction_id: number, update_time: number }, query_runner: QueryRunner) {
        await db.query<ResultSetHeader>(`INSERT INTO transaction_status(transaction_id, update_time) VALUES(?, ?)`, [transaction_id, update_time], query_runner)
    }

    static async DBPayTransaction(params: TransactionParamsDto.PayTransactionParams) {
        const { is_paid, paid_at, payment_method, shipping_price, total_price, updated_at, user_id } = params

        const query = `
        UPDATE TRANSACTION SET 
        payment_method = ?, 
        is_paid = ?, 
        paid_at = ?, 
        shipping_price = ?, 
        total_price = ?, 
        updated_at = ?  
        WHERE user_id = ?`

        return await db.query<ResultSetHeader>(query, [payment_method, is_paid, paid_at, shipping_price, total_price, updated_at, user_id])
    }

    static async DBGetPendingTransaction(user_id: number) {
        const query = `
        SELECT t.id, t.items_price FROM transaction t
        WHERE t.user_id = ? 
        AND t.is_paid = 0 
        `

        return await db.query(query, [user_id])
    }
}