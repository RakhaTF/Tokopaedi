import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateSuperAdmin1701844827300 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const query = `INSERT INTO user (name, email, password, level, created_at) VALUES ('SuperAdmin', 'super.admin@gmail.com', '$2a$10$on3rrDVNqJjHQzsTOQgnaewQ0B7Mc4UVMuDF43KEmIdUsDXc16yEa', 1, 1701856885)`
        await queryRunner.query(query)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const query = `DELETE FROM user WHERE level = 1`
        await queryRunner.query(query)
    }
}
