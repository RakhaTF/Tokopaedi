import { MigrationInterface, QueryRunner } from "typeorm"
import { products } from "dummy/product";

export class InsertIntoProducts1701859009819 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        for (const product of products) {
            await queryRunner.query(
                `INSERT INTO product (name, description, price, stock) VALUES (?, ?, ?, ?)`,
                [product.name, product.description, product.price, product.stock]
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`TRUNCATE TABLE product;`)
    }

}
