import { MigrationInterface, QueryRunner } from "typeorm"

export class AddImageColumnsIntoProduct1701859009800 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE product
        ADD COLUMN img_src VARCHAR(150),
        ADD COLUMN public_id VARCHAR(100)`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE product
        DROP COLUMN img_src,
        DROP COLUMN public_id`)
    }

}