import { MigrationInterface, QueryRunner } from "typeorm"

export class InsertUserRules1701765349273 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const rules = [103, 104, 105, 114, 118, 124];
        const values = rules.map(rule => `(3, ${rule})`).join(', ');
        const query = `INSERT INTO user_group_rules (group_id, rules_id) VALUES ${values}`;
        await queryRunner.query(query);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const query = `DELETE FROM user_group_rules WHERE group_id = 3`;
        await queryRunner.query(query);
    }

}
