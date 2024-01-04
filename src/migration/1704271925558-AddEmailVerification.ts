import { MigrationInterface, QueryRunner } from "typeorm"

export class AddEmailVerification1704271925558 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE user
        ADD COLUMN is_verified BOOLEAN DEFAULT FALSE,
        ADD COLUMN email_token VARCHAR(255)`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE user
        DROP COLUMN is_verified,
        DROP COLUMN email_token`)
    }

}
