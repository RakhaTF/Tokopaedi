import buildServer from "../../index"
import { expect, beforeAll, afterAll, describe, it, } from 'vitest'
import supertest from "supertest"

describe('List of routes accessible to super admin', () => {
    let app;
    let superAdminJwt: string;

    beforeAll(async () => {
        app = await buildServer()
        await app.ready();
        superAdminJwt = process.env.SUPER_ADMIN_JWT as string;
    })

    afterAll(async () => {
        await app.close()
    })

    it('Should return a list of admins', async () => {
        const adminListResponse = {
            "message": [
                {
                    "name": "Admin",
                    "rights": [
                        "UPDATE_USER_LEVEL",
                        "VIEW_SYSTEM_LOG",
                        "CREATE_USER",
                        "VIEW_USER_PROFILE",
                        "UPDATE_USER_PROFILE",
                        "VIEW_USER_LIST",
                        "DELETE_USER",
                        "VIEW_DELETED_USER_LIST",
                        "RESTORE_DELETED_USER",
                        "CHANGE_USER_PASSWORD",
                        "CREATE_PRODUCT",
                        "UPDATE_PRODUCT",
                        "DELETE_PRODUCT",
                        "UPDATE_TRANSACTION_DELIVERY_STATUS",
                        "DELETE_TRANSACTION",
                        "REJECT_TRANSACTION",
                        "APPROVE_TRANSACTION",
                        "VIEW_TRANSACTION_LIST",
                        "VIEW_USER_TRANSACTION_LIST",
                        "VIEW_USER_DELETED_TRANSACTION_LIST",
                        "VIEW_DELETED_TRANSACTION_LIST",
                        "VIEW_USER_SHIPPING_ADDRESS"
                    ],
                    "rules_id": [
                        106,
                        107,
                        108,
                        109,
                        110,
                        111,
                        112,
                        113,
                        114,
                        115,
                        116,
                        117,
                        118,
                        119,
                        120,
                        121,
                        122,
                        123,
                        124,
                        125,
                        126,
                        127
                    ]
                },
                {
                    "name": "Product Manager",
                    "rights": [
                        "CREATE_USER",
                        "VIEW_USER_PROFILE",
                        "UPDATE_USER_PROFILE",
                        "VIEW_USER_LIST",
                        "DELETE_USER",
                        "VIEW_DELETED_USER_LIST",
                        "RESTORE_DELETED_USER"
                    ],
                    "rules_id": [
                        108,
                        109,
                        110,
                        111,
                        112,
                        113,
                        114
                    ]
                },
                {
                    "name": "SuperAdmin",
                    "rights": [
                        "CREATE_RULES",
                        "VIEW_RULES_LIST",
                        "UPDATE_RULES",
                        "DELETE_RULES",
                        "ASSIGN_RULES_TO_ADMIN",
                        "REVOKE_RULES_FROM_ADMIN"
                    ],
                    "rules_id": [
                        100,
                        101,
                        102,
                        103,
                        104,
                        105
                    ]
                },
                {
                    "name": "Transaction Manager",
                    "rights": [
                        "DELETE_PRODUCT",
                        "UPDATE_TRANSACTION_DELIVERY_STATUS",
                        "DELETE_TRANSACTION",
                        "REJECT_TRANSACTION",
                        "APPROVE_TRANSACTION",
                        "VIEW_TRANSACTION_LIST",
                        "VIEW_USER_TRANSACTION_LIST",
                        "VIEW_USER_DELETED_TRANSACTION_LIST",
                        "VIEW_DELETED_TRANSACTION_LIST",
                        "VIEW_USER_SHIPPING_ADDRESS"
                    ],
                    "rules_id": [
                        118,
                        119,
                        120,
                        121,
                        122,
                        123,
                        124,
                        125,
                        126,
                        127
                    ]
                },
                {
                    "name": "User Manager",
                    "rights": [
                        "CREATE_USER",
                        "VIEW_USER_PROFILE",
                        "UPDATE_USER_PROFILE",
                        "VIEW_USER_LIST",
                        "DELETE_USER",
                        "VIEW_DELETED_USER_LIST",
                        "RESTORE_DELETED_USER"
                    ],
                    "rules_id": [
                        108,
                        109,
                        110,
                        111,
                        112,
                        113,
                        114
                    ]
                }
            ]
        }

        const { body } = await supertest(app.server)
            .get('/api/v1/admin/admin-list')
            .set('Authorization', superAdminJwt)
            .set('user-agent', "Test")
            .expect(200)

        expect(body).toEqual(adminListResponse)

        //extract the data
        const data = body.message[0]

        expect(data).toHaveProperty("name")
        expect(data).toHaveProperty("rights")
        expect(data).toHaveProperty("rules_id")
    });

    describe('Super admin interacting with rules endpoints', () => {
        const createNewRuleRequest = {
            rule: "RULE_CREATED_FOR_TESTING"
        }

        const updateNewRuleRequest = {
            rule: "RULE_CREATED_FOR_TESTING_UPDATED"
        }

        let newlyCreatedRulesId: number;

        it('Should create a new rule', async () => {
            const { body } = await supertest(app.server)
                .post('/api/v1/admin/rules/create')
                .set('Authorization', superAdminJwt)
                .set('user-agent', "Test")
                .send(createNewRuleRequest)
                .expect(200)

            expect(body.message).toEqual(true)
        });

        it('Should return a list of rules', async () => {
            const { body } = await supertest(app.server)
                .get('/api/v1/admin/rules/list')
                .set('Authorization', superAdminJwt)
                .set('user-agent', "Test")
                .expect(200)

            //extract the data, last data is newly created rules
            const lastData = body.message[body.message.length - 1]

            newlyCreatedRulesId = lastData.rules_id

            expect(lastData).toHaveProperty("rules_id")
            expect(lastData).toHaveProperty("rules")
        });

        it('Should update newly created rule', async () => {
            const { body } = await supertest(app.server)
                .post('/api/v1/admin/rules/update')
                .set('Authorization', superAdminJwt)
                .set('user-agent', "Test")
                .send({ rules_id: newlyCreatedRulesId, rule: updateNewRuleRequest.rule })

            expect(body.message).toEqual(true)
        });

        it('Should assign a rule', async () => {
            const { body } = await supertest(app.server)
                .post('/api/v1/admin/rules/assign')
                .set('Authorization', superAdminJwt)
                .set('user-agent', "Test")
                .send({ rules_id: newlyCreatedRulesId, group_id: 4 })

            expect(body.message).toEqual(true)
        });

        it('Should revoke a rule', async () => {
            const { body } = await supertest(app.server)
                .post('/api/v1/admin/rules/revoke')
                .set('Authorization', superAdminJwt)
                .set('user-agent', "Test")
                .send({ rules_id: newlyCreatedRulesId, group_id: 4 })

            expect(body.message).toEqual(true)
        });

        it('Should delete a rule', async () => {
            const { body } = await supertest(app.server)
                .post('/api/v1/admin/rules/delete')
                .set('Authorization', superAdminJwt)
                .set('user-agent', "Test")
                .send({ rules_id: newlyCreatedRulesId })
                .expect(200)

            expect(body.message).toEqual(true)
        });
    })
})