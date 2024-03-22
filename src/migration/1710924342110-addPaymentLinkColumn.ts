import { MigrationInterface, QueryRunner } from "typeorm"

export class AddPaymentLinkColumn1710924342110 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        ALTER TABLE transaction ADD payment_link VARCHAR(255) DEFAULT NULL after paid_at;
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        ALTER TABLE transaction DROP COLUMN payment_link;
        `)
    }

}
