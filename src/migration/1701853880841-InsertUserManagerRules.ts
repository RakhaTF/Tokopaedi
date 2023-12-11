import { MigrationInterface, QueryRunner } from "typeorm"

export class InsertUserManagerRules1701853880841 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const rules = [108, 109, 110, 111, 112, 113, 114, 115];
        const values = rules.map(rule => `(4, ${rule})`).join(', ');
        const query = `INSERT INTO user_group_rules (group_id, rules_id) VALUES ${values}`;
        await queryRunner.query(query);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const query = `DELETE FROM user_group_rules WHERE group_id = 5`;
        await queryRunner.query(query);
    }

}
