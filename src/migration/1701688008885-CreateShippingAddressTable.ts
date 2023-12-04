import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateShippingAddressTable1701688008885 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE shipping_address (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                address VARCHAR(255) NOT NULL,
                city VARCHAR(255) NOT NULL,
                postal_code VARCHAR(255) NOT NULL,
                country VARCHAR(255) NOT NULL,
                FOREIGN KEY (user_id) REFERENCES user(id)
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE shipping_address
        `);
    }

}
