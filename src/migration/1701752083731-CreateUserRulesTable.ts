import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateUserRulesTable1701752083731 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE user_rules (
                rules_id INT PRIMARY KEY,
                rules VARCHAR(255) NOT NULL
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE user_rules
        `);
    }
}
