import { MigrationInterface, QueryRunner } from "typeorm"

export class InsertDataIntoUserGroupsRules1701761921393 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const rules = [
            'UPDATE_PRODUCT',
            'DELETE_PRODUCT',
            'CREATE_PRODUCT',
            'VIEW_PRODUCT_LIST',
            'UPDATE_PROFILE',
            'VIEW_PROFILE_DETAIL',
            'UPDATE_USER_PROFILE',
            'VIEW_USER_PROFILE_DETAIL',
            'VIEW_USER_LIST',
            'UPDATE_ADMIN_PROFILE',
            'UPDATE_USER_LEVEL',
            'VIEW_ADMIN_PROFILE_DETAIL',
            'VIEW_ADMIN_LIST',
            'DELETE_USER',
            'CREATE_TRANSACTION',
            'UPDATE_TRANSACTION_DETAIL',
            'VIEW_TRANSACTION_DETAIL',
            'DELETE_TRANSACTION',
            'VIEW_TRANSACTION_LIST',
            'APPROVE_TRANSACTION',
            'REJECT_TRANSACTION',
            'VIEW_USER_TRANSACTION_LIST',
            'CREATE_USER',
            'UPDATE_TRANSACTION_DELIVERY_STATUS',
            'PAY_TRANSACTION',
            'ADD_RULES',
            'DELETE_RULES',
            'UPDATE_RULES'
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
    }

}
