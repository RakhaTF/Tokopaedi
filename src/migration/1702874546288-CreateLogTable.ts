import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateLogTable1702874546288 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE table log(
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            action VARCHAR(100) NOT NULL,
            ip VARCHAR(15) NOT NULL,
            browser VARCHAR(255) NOT NULL,
            time INT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
        )`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP table log`)
    }
}
