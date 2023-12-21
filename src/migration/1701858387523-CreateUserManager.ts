import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateUserManagementStaff1701858387523 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const query = `INSERT INTO user (name, email, password, level, created_at) VALUES ('User Manager', 'user.admin@gmail.com', '$2a$10$on3rrDVNqJjHQzsTOQgnaewQ0B7Mc4UVMuDF43KEmIdUsDXc16yEa', 4, 1701856885)`
        await queryRunner.query(query)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const query = `DELETE FROM user WHERE level = 4`
        await queryRunner.query(query)
    }
}
