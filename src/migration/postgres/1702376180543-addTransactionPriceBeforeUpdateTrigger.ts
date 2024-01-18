import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTransactionPriceBeforeUpdateTrigger1702376180543 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
           CREATE OR REPLACE FUNCTION calculate_total_price_before_update()
           RETURNS TRIGGER AS $$
           BEGIN
               NEW.total_price = NEW.items_price + NEW.shipping_price;
               RETURN NEW;
           END;
           $$ LANGUAGE plpgsql;

           CREATE TRIGGER calculate_total_price_before_update_trigger
           BEFORE UPDATE
           ON transaction
           FOR EACH ROW
           EXECUTE FUNCTION calculate_total_price_before_update();
       `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TRIGGER IF EXISTS calculate_total_price_before_update_trigger`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS calculate_total_price_before_update`);
    }
}
