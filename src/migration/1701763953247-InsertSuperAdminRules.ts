import { MigrationInterface, QueryRunner } from "typeorm"

export class InsertSuperAdminRules1701763953247 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const rules = [100, 101, 102, 103, 104, 105, 129];
        const values = rules.map(rule => `(1, ${rule})`).join(', ');
        const query = `INSERT INTO user_group_rules (group_id, rules_id) VALUES ${values}`;
        await queryRunner.query(query);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const query = `DELETE FROM user_group_rules WHERE group_id = 1`;
        await queryRunner.query(query);
    }

}
