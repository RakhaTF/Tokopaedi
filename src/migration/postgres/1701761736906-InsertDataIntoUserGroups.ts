import { MigrationInterface, QueryRunner } from "typeorm"

export class InsertDataIntoUserGroups1701761736906 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        INSERT INTO user_groups (level_id, group_name) VALUES (1, 'Super Admin'), (2, 'Admin'), (3, 'User'),
        (4, 'User Manager'), (5, 'Product Manager'), (6, 'Transaction Manager')
    `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
        DELETE FROM user_groups WHERE level_id IN (1, 2, 3, 4, 5, 6)
    `)
    }
}
