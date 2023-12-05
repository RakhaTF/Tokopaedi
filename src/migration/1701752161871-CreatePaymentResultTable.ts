import { MigrationInterface, QueryRunner } from "typeorm"

export class CreatePaymentResultTable1701752161871 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE payment_result (
                id INT AUTO_INCREMENT PRIMARY KEY,
                status VARCHAR(255),
                update_time VARCHAR(255),
                email VARCHAR(255)
            )
        `);
    }

    
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE payment_result
        `);
    }

}
