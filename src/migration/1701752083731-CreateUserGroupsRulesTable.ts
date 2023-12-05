import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateUserGroupsRulesTable1701752083731 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE user_group_rules (
                group_id TINYINT(1),
                rules_id INT,
                PRIMARY KEY (rules_id),
                FOREIGN KEY (group_id) REFERENCES user_groups(level_id)
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE user_group_rules
        `);
    }

}
