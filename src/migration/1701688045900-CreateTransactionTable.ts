import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateTransactionTable1701688045900 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE transaction (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                payment_method VARCHAR(255) NOT NULL,
                payment_result_id INT(10),
                items_price DECIMAL(10,2) NOT NULL DEFAULT 0.0,
                shipping_price DECIMAL(10,2) NOT NULL DEFAULT 0.0,
                total_price DECIMAL(10,2) NOT NULL DEFAULT 0.0,
                is_paid TINYINT(1) NOT NULL DEFAULT 0,
                paid_at INT(11),
                is_delivered TINYINT(1) NOT NULL DEFAULT 0,
                delivered_at INT(11),
                created_at INT(11) NOT NULL,
                updated_at INT(11) NOT NULL,
                FOREIGN KEY (user_id) REFERENCES user(id),
                FOREIGN KEY (payment_result_id) REFERENCES payment_result(id)
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE transaction
        `);
    }

}
