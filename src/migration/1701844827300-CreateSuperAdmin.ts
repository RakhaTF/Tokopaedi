import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateSuperAdmin1701844827300 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const query = `INSERT INTO user (name, email, password, level, created_at) VALUES ('SuperAdmin', 'super.admin@gmail.com', '$2y$10$ppOiDmd9MsxJeNhoDZwuLuJ81/Tf7vD15ahZYcVN5009lAL02gMBG', 1, 1701856885)`
        await queryRunner.query(query)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const query = `DELETE FROM user WHERE level = 1`;
        await queryRunner.query(query);
    }

}
