import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateUserGroupsRulesTable1701690035298 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE user_group_rules (
                group_id INT,
                rules_id INT,
                PRIMARY KEY (group_id, rules_id),
                FOREIGN KEY (group_id) REFERENCES user_groups(id),
                FOREIGN KEY (rules_id) REFERENCES user_rules(id)
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE user_group_rules
        `);
    }

}
