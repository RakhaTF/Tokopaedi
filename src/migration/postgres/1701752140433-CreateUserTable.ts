import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserTable1701752140433 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL,
                level SMALLINT NOT NULL DEFAULT 3, 
                created_at INT NOT NULL,
                is_deleted BOOLEAN DEFAULT false,
                FOREIGN KEY (level) REFERENCES user_groups(level_id)
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE user
        `);
    }
}
