import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateShippingAddressTable1701752151534 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE shipping_address (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                address VARCHAR(255) NOT NULL,
                postal_code VARCHAR(255) NOT NULL,
                city VARCHAR(255) NOT NULL,
                province VARCHAR(255) NOT NULL,
                country VARCHAR(255) NOT NULL,
                is_deleted TINYINT(1) DEFAULT '0' COMMENT '0 = false, 1 = true',
                FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
            )
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE shipping_address
        `)
    }
}
