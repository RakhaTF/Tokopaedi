import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateUserGroupsTable1701752076794 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE user_groups (
                level_id SERIAL,
                group_name VARCHAR(255) NOT NULL,
                PRIMARY KEY (level_id),
                UNIQUE (group_name)
            )
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE user_groups
        `)
    }
}
