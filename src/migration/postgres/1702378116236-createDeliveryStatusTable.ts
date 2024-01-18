import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateDeliveryStatusTable1702378116236 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE delivery_status(
                id SERIAL PRIMARY KEY,
                transaction_id INT,
                status SMALLINT DEFAULT '0',
                expedition_name VARCHAR(255) NOT NULL,
                is_delivered BOOLEAN NOT NULL DEFAULT FALSE,
                delivered_at INT DEFAULT NULL,
                updated_at INT,
                FOREIGN KEY (transaction_id) REFERENCES transaction(id) ON DELETE CASCADE
        )`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`TRUNCATE TABLE delivery_status`)
    }
}
