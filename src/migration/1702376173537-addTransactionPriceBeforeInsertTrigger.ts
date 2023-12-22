import { MigrationInterface, QueryRunner } from "typeorm"

export class AddTransactionPriceBeforeInsertTrigger1702376173537 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
           CREATE TRIGGER calculate_total_price_before_insert
            BEFORE INSERT
            ON transaction FOR EACH ROW
            BEGIN
                SET NEW.total_price = NEW.items_price + NEW.shipping_price;
            END
       `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TRIGGER IF EXISTS calculate_total_price_before_insert`)
    }
}
