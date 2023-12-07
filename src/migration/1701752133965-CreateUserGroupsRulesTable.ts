import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateUserGroupsRulesTable1701752133965 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE user_group_rules (
                id INT AUTO_INCREMENT PRIMARY KEY,
                group_id TINYINT(1),
                rules_id INT,
                FOREIGN KEY (rules_id) REFERENCES user_rules(rules_id) ON DELETE CASCADE, 
                FOREIGN KEY (group_id) REFERENCES user_groups(level_id) ON DELETE CASCADE
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE user_group_rules
        `);
    }

}
