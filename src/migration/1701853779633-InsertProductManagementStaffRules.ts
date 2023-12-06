import { MigrationInterface, QueryRunner } from "typeorm"

export class InsertProductManagementStaffRules1701853779633 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const rules = [100, 101, 102, 103];
        const values = rules.map(rule => `(4, ${rule})`).join(', ');
        const query = `INSERT INTO user_group_rules (group_id, rules_id) VALUES ${values}`;
        await queryRunner.query(query);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const query = `DELETE FROM user_group_rules WHERE group_id = 4`;
        await queryRunner.query(query);
    }

}
