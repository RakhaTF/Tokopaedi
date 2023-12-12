import { AppDataSource } from "@infrastructure/mysql/connection";
import { TransactionResponseDto } from "@domain/model/response";
import { TransactionParamsDto } from "@domain/model/params";
import { QueryRunner } from "typeorm";

const db = AppDataSource

export default class TransactionRepository {
    static async DBCreateTransactionId(id: number, query_runner?: QueryRunner){
        if(query_runner && !query_runner.isTransactionActive){
            throw new Error("Must in Transaction")
        }

        const result = await db.query(`INSERT INTO transaction (user_id) VALUES (?)`, [id], query_runner)
        return result
    }

    static async DBInsertOrderItem(params: TransactionParamsDto.InsertOrderItemParams, query_runner?: QueryRunner){
        if(query_runner && !query_runner.isTransactionActive){
            throw new Error("Must in Transaction")
        }

        const products = params.product_id.map((id, index) => {
            return { product_id: id, qty: params.qty[index] };
        });

        const valueProduct = products.map(product => `(${params.insertId}, ${product.product_id}, ${product.qty})`).join(', ')

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

    static async DBUpdateOrder(params: TransactionParamsDto.UpdateOrderParams){
        const result = await db.query(`UPDATE order_item SET qty = ? WHERE order_id = ? AND product_id = ?`, [params.qty, params.order_id, params.product_id])
        return result
    }
}