import { MigrationInterface, QueryRunner } from "typeorm"

export class InsertUserManagementStaffRules1701853880841 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const rules = [104, 106, 107, 108, 113, 122];
        const values = rules.map(rule => `(5, ${rule})`).join(', ');
        const query = `INSERT INTO user_group_rules (group_id, rules_id) VALUES ${values}`;
        await queryRunner.query(query);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const query = `DELETE FROM user_group_rules WHERE group_id = 5`;
        await queryRunner.query(query);
    }

}
