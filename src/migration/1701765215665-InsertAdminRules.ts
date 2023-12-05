import { MigrationInterface, QueryRunner } from "typeorm"

export class InsertAdminRules1701765215665 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const rules = [100, 102, 103, 104, 105, 106, 107, 108, 113, 115, 116, 117, 119, 120, 121, 122, 123];
        const values = rules.map(rule => `(2, ${rule})`).join(', ');
        const query = `INSERT INTO user_group_rules (group_id, rules_id) VALUES ${values}`;
        await queryRunner.query(query);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const query = `DELETE FROM user_group_rules WHERE group_id = 2`;
        await queryRunner.query(query);
    }

}
