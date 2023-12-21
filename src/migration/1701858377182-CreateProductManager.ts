import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateProductManager1701858377182 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const query = `INSERT INTO user (name, email, password, level, created_at) VALUES ('Product Manager', 'product.admin@gmail.com', '$2a$10$on3rrDVNqJjHQzsTOQgnaewQ0B7Mc4UVMuDF43KEmIdUsDXc16yEa', 5, 1701856885)`
        await queryRunner.query(query)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const query = `DELETE FROM user WHERE level = 5`;
        await queryRunner.query(query);
    }

}
