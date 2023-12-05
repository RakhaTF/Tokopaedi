import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateDatabase1701752040000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE DATABASE IF NOT EXISTS tokopaedi;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP DATABASE tokopaedi;
        `);
    }

}
