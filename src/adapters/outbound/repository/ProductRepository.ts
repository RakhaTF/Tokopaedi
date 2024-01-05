import { ProductRequestDto } from "@domain/model/request"
import { ProductResponseDto } from "@domain/model/response"
import { AppDataSource } from "@infrastructure/mysql/connection"
import { RepoPaginationParams } from "key-pagination-sql"
import { ResultSetHeader } from "mysql2"
import { QueryRunner } from "typeorm"

const db = AppDataSource

export default class ProductRepository {
    static async DBGetProductList(params: RepoPaginationParams) {
        const { limit, sort, whereClause } = params
        return await db.query<ProductResponseDto.ProductListResponse>(
            `
        SELECT p.id, p.name, p.description, p.price, p.stock
        FROM product p
        ${whereClause}
        AND p.is_deleted <> 1
        ORDER BY p.id ${sort}
        LIMIT ?`,
            [limit + 1]
        )
    }

    static async DBGetProductDetail(id: number, query_runner?: QueryRunner) {
        return await db.query<ProductResponseDto.ProductDetailResponse[]>(`SELECT id, name, description, price, stock FROM product WHERE id = ?`, [id], query_runner)
    }

    static async DBSoftDeleteProduct(id: number, query_runner?: QueryRunner) {
        return await db.query<ResultSetHeader>(`UPDATE product SET is_deleted = 1 WHERE id = ?`, [id], query_runner)
    }

    static async DBCreateProduct(product: ProductRequestDto.CreateProductRequest, query_runner?: QueryRunner) {
        const { name, description, price, stock } = product
        return await db.query<ResultSetHeader>(`INSERT INTO product(name, description, price, stock) VALUES(?, ?, ?, ?)`, [name, description, price, stock], query_runner)
    }

    static async DBUpdateProduct(product: ProductRequestDto.UpdateProductRequest, query_runner?: QueryRunner) {
        const { id, name, description, price, stock } = product
        return await db.query<ResultSetHeader>(`UPDATE product SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?`, [name, description, price, stock, id], query_runner)
    }

    static async DBCheckIsProductAlive(id: number) {
        return await db.query<{ id: number }[]>(`SELECT p.id FROM product p WHERE p.id = ? AND p.is_deleted <> 1`, [id])
    }

    static async DBGetLowStockProduct() {
        return await db.query<{ name: string; stock: number }[]>(`SELECT p.name, p.stock FROM product p WHERE p.stock <= 10`)
    }
}
