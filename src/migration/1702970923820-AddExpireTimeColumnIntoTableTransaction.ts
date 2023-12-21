import { MigrationInterface, QueryRunner } from "typeorm"

export class AddExpireTimeColumnIntoTableTransaction1702970923820 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE transaction
        ADD COLUMN expire_at INT NOT NULL`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE transaction
        DROP COLUMN expire_at`)
    }

}
