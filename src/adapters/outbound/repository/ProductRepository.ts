import { Product } from "@domain/entity"
import { ProductParamsDto } from "@domain/model/params"
import { ProductResponseDto } from "@domain/model/response"
import { AppDataSource } from "@infrastructure/postgres/connection"
import { RepoPaginationParams } from "key-pagination-sql"
import { LessThanOrEqual, QueryRunner } from "typeorm"

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
        if (query_runner) {
            return query_runner.manager.findOneByOrFail(Product, { id })
        } else {
            return db.manager.findOneByOrFail(Product, { id })
        }
    }

    static async DBSoftDeleteProduct(id: number, query_runner?: QueryRunner) {
        return await query_runner.manager.update(Product, { id }, { is_deleted: true })
    }

    static async DBCreateProduct(product: ProductParamsDto.CreateProductParams, query_runner?: QueryRunner) {
        return await query_runner.manager.insert(Product, product)
    }

    static async DBUpdateProduct(product: ProductParamsDto.UpdateProductParams, query_runner?: QueryRunner) {
        return await query_runner.manager.update(Product, { id: product.id }, product)
    }

    static async DBCheckIsProductAlive(id: number) {
        return await db.manager.find(Product, {
            select: { id: true },
            where: { id, is_deleted: false }
        })
    }

    static async DBGetLowStockProduct() {
        return await db.manager.find(Product, {
            select: {
                name: true,
                stock: true
            },
            where: { stock: LessThanOrEqual(10) }
        })
    }

    static async DBHardDeleteProduct(id: number) {
        return await db.query(`DELETE FROM product WHERE id = ?`, [id])
    }
}
