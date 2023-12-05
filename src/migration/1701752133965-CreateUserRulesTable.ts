import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateUserRulesTable1701752133965 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE user_rules (
                rules_id INT,
                rules VARCHAR(255) NOT NULL,
                FOREIGN KEY (rules_id) REFERENCES user_group_rules(rules_id)
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE user_rules
        `);
    }
}
