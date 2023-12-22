import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateDeliveryStatusTable1702378116236 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE delivery_status(
                id INT AUTO_INCREMENT PRIMARY KEY,
                transaction_id INT,
                status TINYINT(1) DEFAULT '0',
                expedition_name VARCHAR(255) NOT NULL,
                is_delivered TINYINT(1) NOT NULL DEFAULT 0,
                delivered_at INT(11) DEFAULT NULL,
                updated_at INT(11),
                FOREIGN KEY (transaction_id) REFERENCES transaction(id) ON DELETE CASCADE
        )`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`TRUNCATE TABLE delivery_status`)
    }
}
