import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateTransactionTable1701752161871 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE transaction (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                payment_method VARCHAR(255) NOT NULL,
                items_price DECIMAL(10,2) NOT NULL DEFAULT 0.0,
                shipping_price DECIMAL(10,2) NOT NULL DEFAULT 0.0,
                total_price DECIMAL(10,2) NOT NULL DEFAULT 0.0,
                shipping_address_id INT,
                is_paid TINYINT(1) NOT NULL DEFAULT 0,
                paid_at INT(11),
                created_at INT(11) NOT NULL,
                updated_at INT(11) NOT NULL,
                FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
                FOREIGN KEY (shipping_address_id) REFERENCES shipping_address(id) ON DELETE SET NULL
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE transaction
        `);
    }

}
