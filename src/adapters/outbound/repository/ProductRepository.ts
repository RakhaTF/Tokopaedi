import { ProductParamsDto } from "@domain/model/params"
import { ProductResponseDto } from "@domain/model/response"
import { AppDataSource } from "@infrastructure/mysql/connection"
import { RepoPaginationParams } from "key-pagination-sql"
import { ResultSetHeader } from "mysql2"
import { QueryRunner } from "typeorm"

const db = AppDataSource

export default class ProductRepository {
    static async DBGetProductList(params: RepoPaginationParams, having?: string) {
        const { limit, sort, whereClause } = params
        return await db.query<ProductResponseDto.ProductListResponse>(
            `
        SELECT p.id, p.name, p.description, pc.name as category, p.price, p.stock,
        IFNULL(
            (
                SELECT AVG(rating)
                FROM product_review
                WHERE product_id = p.id
            ),  0
        ) AS rating,
        (
            SELECT COUNT(*)
            FROM product_review
            WHERE product_id = p.id
        ) AS review_count,
        GROUP_CONCAT(pg.img_src SEPARATOR ",") AS img_src,
        GROUP_CONCAT(pg.public_id SEPARATOR ",") AS public_id
        FROM product p
        LEFT JOIN product_category pc
            ON p.category = pc.id
        LEFT JOIN product_gallery pg
            ON p.id = pg.product_id
        ${whereClause}
        AND p.is_deleted <> 1
        GROUP BY p.id
        ${having}
        ${sort}
        LIMIT ?`,
            [limit + 1]
        )
    }

    static async DBGetProductDetail(id: number, user_id?: number, query_runner?: QueryRunner) {
        return await db.query<ProductResponseDto.ProductDetailResponse[]>(
            `
        SELECT p.id,
            p.name,
            p.description,
            pc.name AS category_name,
            p.price,
            p.stock,
            GROUP_CONCAT(pg.img_src SEPARATOR ",") AS img_src,
            GROUP_CONCAT(pg.public_id SEPARATOR ",") AS public_id,
            IFNULL(
                (
                    SELECT AVG(rating)
                    FROM product_review
                    WHERE product_id = p.id
                ),  0
            ) AS rating,
            (
                SELECT COUNT(*)
                FROM product_review
                WHERE product_id = p.id
            ) AS review_count,
            CASE 
                WHEN EXISTS (
                        SELECT 1
                        FROM wishlist w
                        JOIN wishlist_collections wc ON w.collection_id = wc.id
                        WHERE w.product_id = p.id AND wc.user_id = ?
                        )
                    THEN True
                ELSE False
                END AS is_wishlisted
        FROM product p
        JOIN product_category pc ON p.category = pc.id
        JOIN product_gallery pg ON p.id = pg.product_id
        WHERE p.id = ?`,
            [user_id, id],
            query_runner
        )
    }

    static async DBSoftDeleteProduct(id: number, query_runner?: QueryRunner) {
        return await db.query<ResultSetHeader>(`UPDATE product SET is_deleted = 1 WHERE id = ?`, [id], query_runner)
    }

    static async DBCreateProduct(product: ProductParamsDto.CreateProductParams, query_runner?: QueryRunner) {
        const { name, description, price, stock, category } = product
        return await db.query<ResultSetHeader>(`INSERT INTO product(name, description, price, category, stock) VALUES(?, ?, ?, ?, ?)`, [name, description, price, category, stock], query_runner)
    }

    static async DBUpdateProduct(product: ProductParamsDto.UpdateProductParams, query_runner?: QueryRunner) {
        const { id, name, description, price, stock } = product
        return await db.query<ResultSetHeader>(`UPDATE product SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?`, [name, description, price, stock, id], query_runner)
    }

    static async DBCheckIsProductAlive(id: number) {
        return await db.query<{ id: number }[]>(`SELECT p.id FROM product p WHERE p.id = ? AND p.is_deleted <> 1`, [id])
    }

    static async DBGetLowStockProduct() {
        return await db.query<{ name: string; stock: number }[]>(`SELECT p.name, p.stock FROM product p WHERE p.stock <= 10`)
    }

    static async DBHardDeleteProduct(id: number) {
        return await db.query(`DELETE FROM product WHERE id = ?`, [id])
    }

    static async GetReviewList(id: number, params: RepoPaginationParams) {
        const { limit, sort, whereClause } = params

        return await db.query(
            `
            SELECT pr.id, pr.user_id, u.name, pr.product_id, pr.rating, pr.comment, pr.created_at
            FROM product_review pr
            JOIN user u
                ON pr.user_id = u.id
            ${whereClause} AND pr.product_id = ?
            ORDER BY pr.rating ${sort}
            LIMIT ?
        `,
            [id, limit + 1]
        )
    }

    static async CreateProductReview(params: ProductParamsDto.CreateProductReviewParams, query_runner: QueryRunner) {
        const { comment, product_id, rating, user_id, created_at } = params

        return await db.query<ResultSetHeader>(
            `
            INSERT INTO product_review(user_id, product_id, rating, comment, created_at)
            VALUES(?, ?, ?, ?, ?)
        `,
            [user_id, product_id, rating, comment, created_at],
            query_runner
        )
    }

    static async GetProductReviewDetail(id: number): Promise<ProductResponseDto.ProductReviewDetailResponse[]> {
        return await db.query(
            `
        SELECT pr.id, pr.user_id, u.name, pr.product_id, pr.rating, pr.comment, pr.created_at
        FROM product_review pr
            JOIN user u
                ON pr.user_id = u.id
        WHERE pr.id = ?
        `,
            [id]
        )
    }

    static async DeleteProductReview(id: number, query_runner: QueryRunner) {
        return await db.query<ResultSetHeader>(`DELETE FROM product_review WHERE id = ?`, [id], query_runner)
    }

    static async CheckExistingReview(user_id: number, product_id: number) {
        return await db.query<{ id: number; user_id: number }[]>(`SELECT id, user_id FROM product_review WHERE product_id = ? AND user_id = ?`, [product_id, user_id])
    }

    static async CheckReviewOwnership(review_id: number) {
        return await db.query<{ id: number; user_id: number }[]>(`SELECT id, user_id FROM product_review WHERE id = ?`, [review_id])
    }

    static async GetCategoryList(params: RepoPaginationParams): Promise<ProductResponseDto.ProductCategoryListResponse> {
        const { limit, sort, whereClause } = params

        return await db.query(
            `
        SELECT pc.id, pc.name, pc.parent_id, pc.cat_path
        FROM product_category pc 
        ${whereClause}
        ORDER BY pc.id ${sort}
        LIMIT ?
        `,
            [limit + 1]
        )
    }

    static async GetCategoryDetail(id: number): Promise<ProductResponseDto.ProductCategoryDetailResponse[]> {
        return await db.query(
            `
        SELECT pc.id, pc.name, pc.parent_id, pc.cat_path
            FROM product_category pc
        WHERE pc.id = ?
        `,
            [id]
        )
    }

    static async CreateNewHeadCategory(params: ProductParamsDto.CreateProductCategoryParams, query_runner: QueryRunner) {
        const { cat_path, name } = params
        return await db.query<ResultSetHeader>(
            `
        INSERT INTO product_category(name, cat_path)
        VALUES(?, ?)
        `,
            [name, cat_path],
            query_runner
        )
    }

    static async CreateNewSubCategory(params: ProductParamsDto.CreateProductCategoryParams, query_runner: QueryRunner) {
        const { cat_path, name, parent_id } = params
        return await db.query<ResultSetHeader>(
            `
        INSERT INTO product_category(name, parent_id, cat_path)
        VALUES(?, ?, ?)
        `,
            [name, parent_id, cat_path],
            query_runner
        )
    }

    static async UpdateCategory(params: ProductParamsDto.UpdateProductCategoryParams, query_runner: QueryRunner) {
        const { id, cat_path, name, parent_id } = params

        return await db.query<ResultSetHeader>(
            `
        UPDATE product_category SET name = ?, parent_id = ?, cat_path = ?
        WHERE id = ?
        `,
            [name, parent_id, cat_path, id],
            query_runner
        )
    }

    static async DeleteCategory(id: number, query_runner: QueryRunner) {
        return await db.query<ResultSetHeader>(`DELETE FROM product_category where id = ?`, [id], query_runner)
    }

    static async CheckExistingCategory(name: string) {
        return await db.query<{ id: number; name: string }[]>(
            `
        SELECT pc.id, pc.name
        FROM product_category pc
        WHERE pc.name = ?`,
            [name]
        )
    }

    static async GetWishlistedProductList(params: RepoPaginationParams) {
        const { limit, sort, whereClause } = params

        return await db.query(
            `
        SELECT p.id,
            p.name,
            p.description,
            p.price,
            GROUP_CONCAT(pg.img_src SEPARATOR ",") AS img_src,
            GROUP_CONCAT(pg.public_id SEPARATOR ",") AS public_id,
            (
                SELECT AVG(rating)
                FROM product_review
                WHERE product_id = p.id
            ) AS rating,
            (
                SELECT COUNT(*)
                FROM product_review
                WHERE product_id = p.id
            ) AS review_count
        FROM wishlist_collections wc
        JOIN wishlist w 
            ON w.collection_id = wc.id
        JOIN user u 
            ON wc.user_id = u.id
        JOIN product p 
            ON p.id = w.product_id
        JOIN product_category pc
            ON p.category = pc.id
        JOIN product_gallery pg 
            ON p.id = pg.product_id
        ${whereClause}
        GROUP BY p.name
        ${sort}
        LIMIT ?
        `,
            [limit + 1]
        )
    }

    static async GetUserWishlistCollection(user_id: number) {
        return await db.query<{ id: number; name: string }[]>(
            `
        SELECT wc.id, wc.name 
        FROM wishlist_collections wc
            JOIN user u
                ON u.id = wc.user_id
        WHERE u.id = ?
        `,
            [user_id]
        )
    }

    static async CreateWishlistCollection(name: string, user_id: number) {
        return await db.query<ResultSetHeader>(`INSERT INTO wishlist_collections(name, user_id) VALUES(?, ?)`, [name, user_id])
    }

    static async UpdateWishlistCollectionName(collection_id: number, name: string) {
        return await db.query<ResultSetHeader>(`UPDATE wishlist_collections SET name = ? WHERE id = ?`, [name, collection_id])
    }

    static async DeleteWishlistCollection(collection_id: number) {
        return await db.query<ResultSetHeader>(`DELETE FROM wishlist_collections WHERE id = ?`, [collection_id])
    }

    static async AddProductToWishlist(collection_id: number, product_id: number) {
        return await db.query<ResultSetHeader>(`INSERT INTO wishlist(product_id, collection_id) VALUES(?, ?)`, [product_id, collection_id])
    }

    static async RemoveProductFromWishlist(collection_id: number, product_id: number) {
        return await db.query<ResultSetHeader>(`DELETE FROM wishlist WHERE collection_id = ? AND product_id = ?`, [collection_id, product_id])
    }

    static async AddProductImageToGallery(params: ProductParamsDto.AddProductImageGalleryParams, query_runner: QueryRunner) {
        const { img_src, product_id, public_id, display_order, thumbnail } = params

        return await db.query<ResultSetHeader>(
            `
        INSERT INTO product_gallery(product_id, img_src, public_id, thumbnail, display_order)
        VALUES (?, ?, ?, ?, ?)
        `,
            [product_id, img_src, public_id, thumbnail, display_order],
            query_runner
        )
    }

    static async FindProductImageDetail(id: number, product_id: number) {
        return await db.query<{ product_id: number; img_src: string; public_id: string; thumbnail: number; display_order: number }[]>(
            `
        SELECT pg.product_id, pg.img_src, pg.public_id, pg.thumbnail, pg.display_order
        FROM product_gallery pg
        WHERE pg.id = ? AND pg.product_id = ?
        `,
            [id, product_id]
        )
    }

    static async DeleteProductImageFromGallery(params: ProductParamsDto.DeleteProductImageGalleryParams, query_runner: QueryRunner) {
        const { product_id, public_id } = params

        return await db.query<ResultSetHeader>(
            `
        DELETE FROM product_gallery WHERE product_id = ? and public_id = ?
        `,
            [product_id, public_id],
            query_runner
        )
    }

    static async UpdateProductImageGallery(params: ProductParamsDto.UpdateProductImageGalleryParams, query_runner: QueryRunner) {
        const { product_id, display_order, img_src, public_id, thumbnail, id } = params

        return await db.query<ResultSetHeader>(
            `
        UPDATE product_gallery SET display_order = ?, img_src = ?, public_id = ?, thumbnail = ? 
        WHERE product_id = ? AND id = ?`,
            [product_id, display_order, img_src, public_id, thumbnail, product_id, id],
            query_runner
        )
    }

    static async GetProductImagePublicId(product_id: number) {
        return await db.query<{ public_id: string }[]>(`SELECT public_id FROM product_gallery where product_id = ?`, [product_id])
    }
}
