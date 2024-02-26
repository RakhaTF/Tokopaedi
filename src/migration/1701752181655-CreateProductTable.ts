import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateProductTable1701752181655 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE product (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                price DECIMAL(10,2) UNSIGNED NOT NULL,
                stock INT UNSIGNED NOT NULL,
                category INT,
                is_deleted TINYINT(1) DEFAULT '0' COMMENT '0 = false, 1 = true',
                FOREIGN KEY (category) REFERENCES product_category(id) ON DELETE CASCADE ON UPDATE CASCADE
            )
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE product
        `)
    }
}
