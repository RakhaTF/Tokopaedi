import { AppDataSource } from "@infrastructure/mysql/connection";
import { TransactionResponseDto } from "@domain/model/response";

const db = AppDataSource

export default class TransactionRepository {
    static async DBCreateTransactionId(id, query_runner){
        if(query_runner && !query_runner.isTransactionActive){
            throw new Error("Must in Transaction")
        }

        const result = await db.query(`INSERT INTO transaction (user_id) VALUES (?)`, [id], query_runner)
        return result
    }

    static async DBInsertOrderItem(insertId, product_id, qty, query_runner){
        if(query_runner && !query_runner.isTransactionActive){
            throw new Error("Must in Transaction")
        }

        const products = product_id.map((id, index) => {
            return { product_id: id, qty: qty[index] };
        });

        console.log(products)

        const valueProduct = products.map(product => `(${insertId}, ${product.product_id}, ${product.qty})`).join(', ')

        const queryProduct = `INSERT INTO order_item (order_id, product_id, qty) VALUES ${valueProduct}`

        const result = await db.query(queryProduct)

        return result
    }

    static async DBGetUserOrderDomain(insertId, query_runner){
        if(query_runner && !query_runner.isTransactionActive){
            throw new Error("Must in Transaction")
        }

        const result = await db.query<TransactionResponseDto.GetUserOrderResponse>(`SELECT order_id, qty, product_id FROM order_item WHERE order_id = ?`
        [insertId], query_runner)

        return result
    }
}