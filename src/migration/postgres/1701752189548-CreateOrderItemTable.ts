import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateOrderItemTable1701752189548 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE order_item (
                id SERIAL PRIMARY KEY,
                order_id INT NOT NULL,
                qty INT NOT NULL,
                product_id INT,
                FOREIGN KEY (order_id) REFERENCES transaction(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES product(id) ON DELETE SET NULL
            )
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE order_item
        `)
    }
}
