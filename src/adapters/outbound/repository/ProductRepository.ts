import { ProductParamsDto } from "@domain/model/params"
import { ProductResponseDto } from "@domain/model/response"
import { AppDataSource } from "@infrastructure/postgres/connection"
import { RepoPaginationParams } from "key-pagination-sql"
import { ResultSetHeader } from "mysql2"
import { QueryRunner } from "typeorm"

const db = AppDataSource

export default class ProductRepository {
    static async DBGetProductList(params: RepoPaginationParams) {
        const { limit, sort, whereClause } = params
        return await db.query<ProductResponseDto.ProductListResponse>(
            `
        SELECT p.id, p.name, p.description, p.price, p.stock, p.public_id, p.img_src
        FROM product p
        ${whereClause}
        AND p.is_deleted != true
        ORDER BY p.id ${sort}
        LIMIT $1`,
            [limit + 1]
        )
    }

    static async DBGetProductDetail(id: number, query_runner?: QueryRunner) {
        return await db.query<ProductResponseDto.ProductDetailResponse[]>(`SELECT p.id, p.name, p.description, p.price, p.stock, p.public_id, p.img_src FROM product p WHERE id = $1`, [id], query_runner)
    }

    static async DBSoftDeleteProduct(id: number, query_runner?: QueryRunner) {
        return await db.query<ResultSetHeader>(`UPDATE product SET is_deleted = true WHERE id = $1`, [id], query_runner)
    }

    static async DBCreateProduct(product: ProductParamsDto.CreateProductParams, query_runner?: QueryRunner) {
        const { name, description, price, stock, img_src, public_id } = product
        return await db.query<ResultSetHeader>(`INSERT INTO product(name, description, price, stock, img_src, public_id) VALUES($1, $2, $3, $4, $5, $6)`, [name, description, price, stock, img_src, public_id], query_runner)
    }

    static async DBUpdateProduct(product: ProductParamsDto.UpdateProductParams, query_runner?: QueryRunner) {
        const { id, name, description, price, stock, img_src, public_id } = product
        return await db.query<ResultSetHeader>(`UPDATE product SET name = $1, description = $2, price = $3, stock = $4, img_src = $5, public_id = $6 WHERE id = $7`, [name, description, price, stock, img_src, public_id, id], query_runner)
    }

    static async DBCheckIsProductAlive(id: number) {
        return await db.query<{ id: number }[]>(`SELECT p.id FROM product p WHERE p.id = $1 AND p.is_deleted != true`, [id])
    }

    static async DBGetLowStockProduct() {
        return await db.query<{ name: string; stock: number }[]>(`SELECT p.name, p.stock FROM product p WHERE p.stock <= 10`)
    }

    static async DBHardDeleteProduct(id: number) {
        return await db.query(`DELETE FROM product WHERE id = ?`, [id])
    }
}
