import { MigrationInterface, QueryRunner } from "typeorm"

export class InsertShippingAndTransactionManagementStaffRules1701853969708 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const rules = [119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129];
        const values = rules.map(rule => `(6, ${rule})`).join(', ');
        const query = `INSERT INTO user_group_rules (group_id, rules_id) VALUES ${values}`;
        await queryRunner.query(query);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const query = `DELETE FROM user_group_rules WHERE group_id = 6`;
        await queryRunner.query(query);
    }

}
