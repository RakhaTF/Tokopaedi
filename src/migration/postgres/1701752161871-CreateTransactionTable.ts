import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateTransactionTable1701752161871 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE transaction (
                id SERIAL PRIMARY KEY,
                user_id INT NOT NULL,
                payment_method VARCHAR(255),
                items_price DECIMAL(10,2) NOT NULL DEFAULT 0.0,
                shipping_price DECIMAL(10,2) NOT NULL DEFAULT 0.0,
                total_price DECIMAL(10,2) NOT NULL DEFAULT 0.0,
                shipping_address_id INT,
                is_paid BOOLEAN NOT NULL DEFAULT FALSE,
                paid_at INT,
                created_at INT NOT NULL,
                updated_at INT NOT NULL,
                is_deleted BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (shipping_address_id) REFERENCES shipping_address(id) ON DELETE SET NULL
            )
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE transaction
        `)
    }
}
