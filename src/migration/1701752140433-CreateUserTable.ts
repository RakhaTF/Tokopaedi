import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateUserTable1701752140433 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE user (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL,
                level TINYINT(1) NOT NULL DEFAULT '3', 
                created_at INT NOT NULL,
                is_deleted TINYINT(1) DEFAULT '0' COMMENT '0 = false, 1 = true',
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
