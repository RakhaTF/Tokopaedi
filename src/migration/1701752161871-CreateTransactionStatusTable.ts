import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateTransactionStatusTable1701752161871 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE transaction_status (
                id INT AUTO_INCREMENT PRIMARY KEY,
                status TINYINT(1) DEFAULT '0',
                update_time VARCHAR(255),
                email VARCHAR(255),
                delivery_id INT DEFAULT NULL,
                delivery_status TINYINT(1) DEFAULT '0'
            )
        `);
    }

    
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE payment_result
        `);
    }

}
