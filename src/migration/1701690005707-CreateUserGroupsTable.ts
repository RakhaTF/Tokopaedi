import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateUserGroupsTable1701690005707 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE user_groups (
                id TINYINT,
                group_name VARCHAR(255),
                PRIMARY KEY (id),
                FOREIGN KEY (id) REFERENCES user(level)
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE user_groups
        `);
    }


}
