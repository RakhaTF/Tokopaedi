import { MigrationInterface, QueryRunner } from "typeorm"

export class InsertDataIntoUserGroupsRules1701761921393 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const rules = [
            'CREATE_RULES',
            'UPDATE_RULES',
            'DELETE_RULES',
            'ASSIGN_RULES_TO_ADMIN',
            'REVOKE_RULES_FROM_ADMIN',
            'UPDATE_USER_LEVEL',
            'VIEW_SYSTEM_LOG',
            'CREATE_USER',
            'VIEW_USER_PROFILE',
            'UPDATE_USER_PROFILE',
            'VIEW_USER_LIST',
            'DELETE_USER',
            'VIEW_DELETED_USER_LIST',
            'RESTORE_DELETED_USER',
            'CHANGE_USER_PASSWORD',
            'CREATE_PRODUCT',
            'UPDATE_PRODUCT',
            'DELETE_PRODUCT',
            'UPDATE_TRANSACTION_DELIVERY_STATUS',
            'DELETE_TRANSACTION',
            'REJECT_TRANSACTION',
            'APPROVE_TRANSACTION',
            'VIEW_TRANSACTION_LIST',
            'VIEW_USER_TRANSACTION_LIST',
            'VIEW_USER_SHIPPING_ADDRESS',
            'VIEW_USER_SHIPPING_ADDRESS_LIST',
        ];



        let rules_id = 100;
        for (const rule of rules) {
            await queryRunner.query(`
                INSERT INTO user_rules (rules_id, rules) 
            VALUES (${rules_id}, '${rule}')
            `);
            rules_id++;
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM user_rules`);
    }

}
