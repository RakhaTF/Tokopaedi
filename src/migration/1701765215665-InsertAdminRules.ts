import { MigrationInterface, QueryRunner } from "typeorm"

export class InsertAdminRules1701765215665 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const rules = [106
            , 107
            , 108
            , 109
            , 110
            , 111
            , 112
            , 113
            , 114
            , 115
            , 116
            , 117
            , 118
            , 119
            , 120
            , 121
            , 122
            , 123
            , 124
            , 125
            , 126
            , 127
            , 128];
        const values = rules.map(rule => `(2, ${rule})`).join(', ');
        const query = `INSERT INTO user_group_rules (group_id, rules_id) VALUES ${values}`;
        await queryRunner.query(query);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const query = `DELETE FROM user_group_rules WHERE group_id = 2`;
        await queryRunner.query(query);
    }

}
