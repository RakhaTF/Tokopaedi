import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateTransactionManager1701858403391 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const query = `INSERT INTO users (name, email, password, level, created_at, is_verified) VALUES ('Transaction Manager', 'transaction.admin@gmail.com', '$2a$10$on3rrDVNqJjHQzsTOQgnaewQ0B7Mc4UVMuDF43KEmIdUsDXc16yEa', 6, 1701856885, TRUE)`
        await queryRunner.query(query)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const query = `DELETE FROM user WHERE level = 6`
        await queryRunner.query(query)
    }
}
