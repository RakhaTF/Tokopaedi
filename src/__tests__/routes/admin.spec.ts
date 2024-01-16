import buildServer from "../../index"
import { expect, beforeAll, afterAll, describe, it, } from 'vitest'
import supertest from "supertest"

describe('Lists of routes accessible to admin', () => {
    let app;
    let superAdminJwt: string;
    let adminData;

    const systemLogColumnNames = [
        "id",
        "user_id",
        "name",
        "action",
        "ip",
        "browser",
        "time"
    ]

    beforeAll(async () => {
        app = await buildServer()
        await app.ready();
        superAdminJwt = process.env.SUPER_ADMIN_JWT as string;
        adminData = {
            "id": 1,
            "name": "SuperAdmin",
            "email": "super.admin@gmail.com",
            "level": 1,
            "created_at": 1701856885,
            "group_rules": "100,101,102,103,104,105"
        }
    })

    afterAll(async () => {
        await app.close()
    })

    it('Should fetch super admin user profile', async () => {
        const { body } = await supertest(app.server)
            .get('/api/v1/admin/profile')
            .set('Authorization', superAdminJwt)
            .set('user-agent', "Test")
            .expect(200)

        expect(body.message).toEqual(adminData)
    });

    it('Should update self profile', async () => {
        const updateProfileRequest = {
            name: "Superadmin tokopaedi",
            email: "super.admin@tokopaedi.com"
        }

        const { body } = await supertest(app.server)
            .post('/api/v1/admin/update-profile')
            .set('Authorization', superAdminJwt)
            .set('user-agent', "Test")
            .send(updateProfileRequest)
            .expect(200)

        expect(body.message).toEqual({ id: 1, ...updateProfileRequest })
    });

    it('Should update user level', async () => {
        const updateUserLevelRequest = {
            user_id: 3,
            level: 4
        }

        const { body } = await supertest(app.server)
            .post('/api/v1/admin/update-user-level')
            .set('Authorization', superAdminJwt)
            .set('user-agent', "Test")
            .send(updateUserLevelRequest)

        expect(body.message).toEqual(true)
    });

    it('Should revert update user level', async () => {
        const updateUserLevelRequest = {
            user_id: 3,
            level: 5
        }

        const { body } = await supertest(app.server)
            .post('/api/v1/admin/update-user-level')
            .set('Authorization', superAdminJwt)
            .set('user-agent', "Test")
            .send(updateUserLevelRequest)

        expect(body.message).toEqual(true)
    });

    it('Should return the list of system log', async () => {

        const getSystemLogRequest = {
            lastId: 0,
            limit: 1,
            search: "",
            sort: "ASC"
        }

        const { body } = await supertest(app.server)
            .post('/api/v1/admin/log/list')
            .set('Authorization', superAdminJwt)
            .set('user-agent', "Test")
            .send(getSystemLogRequest)

        //extract the data
        const data = body.message.data
        const column = body.message.column
        const currentPageDataCount = body.message.currentPageDataCount

        expect(data.length).toEqual(1)
        expect(currentPageDataCount).toEqual(1)
        systemLogColumnNames.forEach((element) => expect(column).toContain(element))
    });

    it('Should revert update self profile', async () => {
        const updateProfileRequest = {
            name: adminData.name,
            email: adminData.email
        }

        const { body } = await supertest(app.server)
            .post('/api/v1/admin/update-profile')
            .set('Authorization', superAdminJwt)
            .set('user-agent', "Test")
            .send(updateProfileRequest)

        expect(body.message).toEqual({ id: 1, ...updateProfileRequest })
    });

    describe('Fail test scenario', () => {
        it('Should fail to update profile with prohibited name', async () => {
            const updateProfileRequest = {
                name: "bajingan",
                email: adminData.email
            }

            const { body } = await supertest(app.server)
                .post('/api/v1/admin/update-profile')
                .set('Authorization', superAdminJwt)
                .set('user-agent', "Test")
                .send(updateProfileRequest)
                .expect(500)

            expect(body.message).toEqual("Banned words name")
        });
    })
})