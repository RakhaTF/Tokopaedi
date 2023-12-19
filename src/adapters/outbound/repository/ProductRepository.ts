import { PaginationParamsDto } from "@domain/model/params";
import { ProductRequestDto } from "@domain/model/request";
import { ProductResponseDto } from "@domain/model/response";
import { AppDataSource } from "@infrastructure/mysql/connection";
import { ResultSetHeader } from "mysql2";
import { QueryRunner } from "typeorm";

const db = AppDataSource;

export default class ProductRepository {
    static async DBGetProductList(params: PaginationParamsDto.RepoPaginationParams) {
        const { limit, sort, whereClause } = params
        return await db.query<ProductResponseDto.ProductListResponse>(`
        SELECT p.id, p.name, p.description, p.price, p.stock
        FROM product p
        ${whereClause}
        ORDER BY p.id ${sort}
        LIMIT ?`, [limit + 1])
    }

    static async DBGetProductDetail(id: number, query_runner?: QueryRunner) {
        return await db.query<ProductResponseDto.ProductDetailResponse[]>(`SELECT id, name, description, price, stock FROM product WHERE id = ?`, [id], query_runner)
    }

    static async DBDeleteProduct(id: number, query_runner?: QueryRunner) {
        return await db.query<ResultSetHeader>(`DELETE FROM product WHERE id = ?`, [id], query_runner)
    }

    static async DBCreateProduct(product: ProductRequestDto.CreateProductRequest, query_runner?:QueryRunner) {
        const { name, description, price, stock } = product
        return await db.query<ResultSetHeader>(`INSERT INTO product(name, description, price, stock) VALUES(?, ?, ?, ?)`, [name, description, price, stock], query_runner)
    }

    static async DBUpdateProduct(product: ProductRequestDto.UpdateProductRequest, query_runner?: QueryRunner) {
        const { id, name, description, price, stock } = product
        return await db.query<ResultSetHeader>(`UPDATE product SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?`, [name, description, price, stock, id], query_runner)
    }
}