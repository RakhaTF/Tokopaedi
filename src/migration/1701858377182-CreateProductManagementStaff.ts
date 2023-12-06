import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateProductManagementStaff1701858377182 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const query = `INSERT INTO user (name, email, password, level, created_at) VALUES ('Product Management Staff', 'product.admin@gmail.com', '$2y$10$ppOiDmd9MsxJeNhoDZwuLuJ81/Tf7vD15ahZYcVN5009lAL02gMBG', 4, 1701856885)`
        await queryRunner.query(query)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const query = `DELETE FROM user WHERE level = 4`;
        await queryRunner.query(query);
    }

}
