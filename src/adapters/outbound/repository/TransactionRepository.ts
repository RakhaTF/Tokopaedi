import { AppDataSource } from "@infrastructure/mysql/connection";
import { TransactionResponseDto } from "@domain/model/response";
import { TransactionParamsDto } from "@domain/model/params";
import { QueryRunner } from "typeorm";
import { ResultSetHeader } from "mysql2"
const db = AppDataSource

export default class TransactionRepository {
    static async DBCreateTransactionId(params: TransactionParamsDto.CreateTransactionIdParams, query_runner?: QueryRunner) {
        if (query_runner && !query_runner.isTransactionActive) {
            throw new Error("Must in Transaction")
        }

        const result = await db.query(`INSERT INTO transaction (user_id, items_price, created_at, updated_at) VALUES (?,?,?,?)`, [params.id, params.items_price, params.created_at, params.updated_at], query_runner)
        return result
    }

    static async DBInsertOrderItem(valueProduct: string, query_runner?: QueryRunner) {
        if (query_runner && !query_runner.isTransactionActive) {
            throw new Error("Must in Transaction")
        }

        const result = await db.query(`INSERT INTO order_item (order_id, product_id, qty) VALUES ${valueProduct}`, [], query_runner)

        return result
    }

    static async DBGetOrderItemByOrderId(insertId: number, query_runner?: QueryRunner): Promise<TransactionResponseDto.GetOrderItemByOrderIdResponse[]> {
        if (query_runner && !query_runner.isTransactionActive) {
            throw new Error("Must in Transaction")
        }

        const result = await db.query<TransactionResponseDto.GetOrderItemByOrderIdResponse[]>(
            `
        SELECT a.order_id, a.product_id, a.qty FROM order_item a WHERE a.order_id = ?`,
            [insertId],
            query_runner
        )

        return result
    }

    static async DBGetCurrentTransactionDetail(id: number, query_runner?: QueryRunner): Promise<TransactionResponseDto.GetTransactionDetailQueryResult[]> {
        if (query_runner && !query_runner.isTransactionActive) {
            throw new Error("Must in Transaction")
        }

        return await db.query(
            `
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
        `,
            [id]
        )
    }

    static async DBUpdateOrder(params: TransactionParamsDto.UpdateOrderParams, query_runner: QueryRunner) {
        if (query_runner && !query_runner.isTransactionActive) {
            throw new Error("Must in Transaction")
        }
        const result = await db.query(`UPDATE order_item SET qty = ? WHERE order_id = ? AND product_id = ?`, [params.qty, params.order_id, params.product_id], query_runner)
        return result
    }

    static async DBUpdateTransactionProductQty(params: TransactionParamsDto.UpdateTransactionProductQty, query_runner: QueryRunner) {
        if (query_runner && !query_runner.isTransactionActive) {
            throw new Error("Must in Transaction")
        }
        const result = await db.query(`UPDATE transaction SET items_price = ?, updated_at = ? WHERE id = ?`, [params.items_price, params.updated_at, params.order_id], query_runner)
        return result
    }

    static async DBCreateTransactionStatus({ transaction_id, update_time }: { transaction_id: number; update_time: number }, query_runner: QueryRunner) {
        await db.query<ResultSetHeader>(`INSERT INTO transaction_status(transaction_id, update_time) VALUES(?, ?)`, [transaction_id, update_time], query_runner)
    }

    static async DBPayTransaction(params: TransactionParamsDto.PayTransactionRepositoryParams, query_runner: QueryRunner) {
        const { is_paid, paid_at, payment_method, shipping_price, updated_at, user_id, shipping_address_id, transaction_id } = params

        const query = `
        UPDATE TRANSACTION SET 
        payment_method = ?, 
        is_paid = ?, 
        paid_at = ?, 
        shipping_address_id = ?, 
        shipping_price = ?, 
        updated_at = ?
        WHERE user_id = ? AND id = ?`

        return await db.query<ResultSetHeader>(query, [payment_method, is_paid, paid_at, shipping_address_id, shipping_price, updated_at, user_id, transaction_id], query_runner)
    }

    static async DBGetPendingTransaction(user_id: number) {
        const query = `
        SELECT t.id, t.items_price FROM transaction t
        WHERE t.user_id = ? 
        AND t.is_paid = 0 
        `

        return await db.query(query, [user_id])
    }

    static async DBCreateDeliveryStatus(params: TransactionParamsDto.CreateDeliveryStatusParams, query_runner: QueryRunner) {
        const { transaction_id, status, expedition_name, is_delivered, delivered_at, updated_at } = params

        const query = `
        INSERT INTO delivery_status
        (transaction_id, status, expedition_name, is_delivered, delivered_at, updated_at)
        VALUES(?, ?, ?, ?, ?, ?)`

        return await db.query<ResultSetHeader>(query, [transaction_id, status, expedition_name, is_delivered, delivered_at, updated_at], query_runner)
    }

    static async DBGetTransactionDetail(id: number): Promise<TransactionResponseDto.TransactionDetailQueryResult[]> {
        return await db.query(`
        SELECT u.id AS user_id,
                t.id AS transaction_id,
                COALESCE(u.name, 'Not Available') AS name,
                COALESCE(t.items_price, 0) AS items_price,
                COALESCE(t.shipping_price, 0) AS shipping_price,
                COALESCE(t.total_price, 0) AS total_price,
                COALESCE(GROUP_CONCAT(p.name SEPARATOR ","), 'No Products') AS product_bought,
                COALESCE(GROUP_CONCAT(o.qty SEPARATOR ","), 'No Products') AS qty,
                CASE 
                    WHEN t.is_paid = 0
                        THEN 'Unpaid'
                    WHEN t.is_paid = 1
                        THEN 'Paid'
                    ELSE 'Payment Status Not Available'
                END AS is_paid,
                COALESCE(t.paid_at, 'Not Available') AS paid_at,
                CASE 
                    WHEN ts.STATUS = 0
                        THEN 'Pending'
                    WHEN ts.STATUS = 1
                        THEN 'Approved'
                    WHEN ts.STATUS = 2
                        THEN 'Rejected'
                    ELSE 'Transaction Status Not Available'
                END AS transaction_status,
                CASE 
                    WHEN ds.STATUS = 0
                        THEN 'Pending'
                    WHEN ds.STATUS = 1
                        THEN 'On Delivery'
                    WHEN ds.STATUS = 2
                        THEN 'Delivered'
                    WHEN ds.STATUS = 3
                        THEN 'Rejected'
                    ELSE 'Delivery Status Not Available'
                END AS delivery_status,
                COALESCE(t.created_at, 'Not Available') AS created_at,
                COALESCE(sa.address, 'Not Available') AS address, 
                COALESCE(sa.postal_code, 'Not Available') AS postal_code, 
                COALESCE(sa.city, 'Not Available') AS city, 
                COALESCE(sa.province, 'Not Available') AS province, 
                COALESCE(sa.country, 'Not Available') AS country
            FROM USER u
            LEFT JOIN TRANSACTION t ON u.id = t.user_id
            LEFT JOIN transaction_status ts ON t.id = ts.transaction_id
            LEFT JOIN delivery_status ds ON t.id = ds.transaction_id
            LEFT JOIN order_item o ON t.id = o.order_id
            LEFT JOIN product p ON o.product_id = p.id
            LEFT JOIN shipping_address sa  ON t.shipping_address_id = sa.id
            WHERE t.id = ?
            GROUP BY t.id
    `,[id])
    }
    static async DBGetUserTransactionListById(userid: number): Promise<TransactionResponseDto.GetTransactionListResponse[]>{
        return db.query<TransactionResponseDto.GetTransactionListResponse[]>(
            `SELECT t.id, t.user_id, t.payment_method, t.items_price, t.shipping_price, t.total_price,
                t.shipping_address_id, t.is_paid, t.paid_at, t.created_at, 
                t.updated_at FROM transaction t WHERE user_id = ?`, [userid])
    }

    static async DBUpdateDeliveryStatus(params: TransactionParamsDto.UpdateDeliveryStatusParams) {
        const { is_delivered, status, transaction_id, updated_at } = params
        
        const query = `UPDATE delivery_status SET status = ?, is_delivered = ?, updated_at = ? WHERE transaction_id = ?`
        return await db.query<ResultSetHeader>(query, [status, is_delivered, updated_at, transaction_id])
    }

    static async DBUpateTransactionStatus(params: TransactionParamsDto.UpdateTransactionStatusParams) {
        const { status, transaction_id, updated_at } = params
        return await db.query<ResultSetHeader>(`
        UPDATE transaction_status SET status = ?, update_time = ? WHERE transaction_id = ?`, [status, updated_at, transaction_id])
    }

    static async DBGetTransactionStatus(transaction_id: number): Promise<TransactionResponseDto.GetTransactionStatusResponse[]> { 
        return await db.query(`
        SELECT ts.status FROM transaction_status ts
        RIGHT JOIN transaction t
            ON ts.transaction_id = t.id
        WHERE t.id = ?
        `, [transaction_id])
    }
}