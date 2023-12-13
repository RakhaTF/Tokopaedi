import { ProductRequestDto } from "@domain/model/request";
import { ProductResponseDto } from "@domain/model/response";
import { AppDataSource } from "@infrastructure/mysql/connection";
import { ResultSetHeader } from "mysql2";
import { QueryRunner } from "typeorm";

const db = AppDataSource;

export default class ProductRepository {
    static async DBGetProductList() {
        return await db.query<ProductResponseDto.ProductListResponse>(`SELECT id, name, description, price, stock FROM product`)
    }

    static async DBGetProductDetail(id: number) {
        return await db.query<ProductResponseDto.ProductDetailResponse[]>(`SELECT id, name, description, price, stock FROM product WHERE id = ?`, [id])
    }

    static async DBDeleteProduct(id: number) {
        return await db.query<ResultSetHeader>(`DELETE FROM product WHERE id = ?`, [id])
    }

    static async DBCreateProduct(product: ProductRequestDto.CreateProductRequest) {
        const { name, description, price, stock } = product
        return await db.query<ResultSetHeader>(`INSERT INTO product(name, description, price, stock) VALUES(?, ?, ?, ?)`, [name, description, price, stock])
    }

    static async DBUpdateProduct(product: ProductRequestDto.UpdateProductRequest, query_runner?: QueryRunner) {
        const { id, name, description, price, stock } = product
        return await db.query<ResultSetHeader>(`UPDATE product SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?`, [name, description, price, stock, id], query_runner)
    }
}