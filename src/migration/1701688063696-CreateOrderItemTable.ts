import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateOrderItemTable1701688063696 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE order_item (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                qty INT NOT NULL,
                price DECIMAL(10,2) NOT NULL,
                product_id INT NOT NULL,
                FOREIGN KEY (order_id) REFERENCES transaction(id),
                FOREIGN KEY (product_id) REFERENCES product(id)
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE order_item
        `);
    }

}
