import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateShippingAndTransactionManagementStaff1701858403391 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const query = `INSERT INTO user (name, email, password, level, created_at) VALUES ('Shipping and Transaction Management Staff', 'SnT.admin@gmail.com', '$2y$10$ppOiDmd9MsxJeNhoDZwuLuJ81/Tf7vD15ahZYcVN5009lAL02gMBG', 6, 1701856885)`
        await queryRunner.query(query)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const query = `DELETE FROM user WHERE level = 6`;
        await queryRunner.query(query);
    }

}
