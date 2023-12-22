import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateTransactionStatusTable1701752168949 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE transaction_status (
                id INT AUTO_INCREMENT PRIMARY KEY,
                transaction_id INT,
                status TINYINT(1) DEFAULT '0',
                update_time INT(11),
                FOREIGN KEY (transaction_id) REFERENCES transaction(id) ON DELETE CASCADE
            )
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE payment_result
        `)
    }
}
