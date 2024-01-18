import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateProductTable1701752181655 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE product (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
                stock BIGINT NOT NULL,
                is_deleted BOOLEAN DEFAULT FALSE
            )
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE product
        `)
    }
}
