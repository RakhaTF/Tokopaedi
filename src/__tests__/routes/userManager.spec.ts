import buildServer from "../../index"
import { expect, beforeAll, afterAll, describe, it, } from 'vitest'
import supertest from "supertest"
import AdminDomainService from "../../../src/domain/service/AdminDomainService"
import AdminAppService from "../../application/service/Admin"

describe('Lists of routes accessible to user manager', () => {
    let app;
    let superAdminJwt: string;
    let newlyRegisteredUserId: number;

    beforeAll(async () => {
        app = await buildServer()
        await app.ready();
        superAdminJwt = process.env.SUPER_ADMIN_JWT as string;
    })

    afterAll(async () => {
        await app.close()
    })

    const createNewUserData = {
        name: "Rakha User Manager",
        email: "rakhaUserManager@gmail.com",
        password: "12345678",
    }

    const updateUserDataRequest = {
        name: "Rakha User Manager Updated",
        email: "rakhaUserManager.tokopaedi@gmail.com"
    }

    const createUserColumnNames = [
        "name",
        "email",
        "level",
        "created_at"
    ]

    const userListColumnNames = [
        "id",
        "name",
        "email",
        "created_at",
        "is_deleted"
    ]

    it('Should create a new user', async () => {
        const { body } = await supertest(app.server)
            .post('/api/v1/admin/create-user')
            .set('Authorization', superAdminJwt)
            .set('user-agent', "Test")
            .send(createNewUserData)
            .expect(200)

        //extract the data
        const data = body.message
        expect(data.level).toEqual(3)
        expect(data.name).toEqual(createNewUserData.name)
        expect(data.email).toEqual(createNewUserData.email)

        createUserColumnNames.forEach((element) => expect(data).toHaveProperty(element))
    });

    it('Should return list of user with filter to return newly created user', async () => {
        const userListRequest = {
            lastId: 0,
            limit: 1,
            search: "",
            sort: "ASC"
        }

        const { body } = await supertest(app.server)
            .post('/api/v1/admin/user-list')
            .set('Authorization', superAdminJwt)
            .set('user-agent', "Test")
            .send(userListRequest)
            .expect(200)

        //extract the data
        const data = body.message.data
        const firstData = data[0]
        const userStatus = firstData[4]

        //extract the id
        newlyRegisteredUserId = firstData[0]

        expect(userStatus).toEqual("Active")
        expect(body.message.column).toEqual(userListColumnNames)
    });

    it('Should return the detail of newly created user', async () => {
        const userColumnNames = ["id", "email", "name", "created_at"]
        const { body } = await supertest(app.server)
            .post('/api/v1/admin/user-detail')
            .set('Authorization', superAdminJwt)
            .set('user-agent', "Test")
            .send({ email: createNewUserData.email })
            .expect(200)

        //extract the data
        const data = body.message

        userColumnNames.forEach((element) => expect(data).toHaveProperty(element))
        expect(data.email).toEqual(createNewUserData.email)
        expect(data.name).toEqual(createNewUserData.name)
    });

    it('Should update user data', async () => {

        const { body } = await supertest(app.server)
            .post('/api/v1/admin/update-user')
            .set('Authorization', superAdminJwt)
            .set('user-agent', "Test")
            .send({ ...updateUserDataRequest, userid: newlyRegisteredUserId })

        //extract the data
        const data = body.message

        expect(data).toHaveProperty("id")
        expect(data).toHaveProperty("email")
        expect(data).toHaveProperty("name")

        expect(data.name).toEqual(updateUserDataRequest.name)
        expect(data.email).toEqual(updateUserDataRequest.email)
    });

    it('Should update/change user password', async () => {
        const changeUserPasswordRequest = {
            userid: newlyRegisteredUserId,
            password: "passwordBaru",
            confirmPassword: "passwordBaru"
        }

        const { body } = await supertest(app.server)
            .post('/api/v1/admin/change-user-pass')
            .set('Authorization', superAdminJwt)
            .set('user-agent', "Test")
            .send(changeUserPasswordRequest)
            .expect(200)

        expect(body.message).toEqual(true)
    });

    describe('Fail test scenario', () => {
        it('Should fail to create user with bad name', async () => {
            const { body } = await supertest(app.server)
                .post('/api/v1/admin/create-user')
                .set('Authorization', superAdminJwt)
                .set('user-agent', "Test")
                .send({ ...createNewUserData, name: "anjing" })
                .expect(500)

            expect(body.message).toEqual("You can't use this name!")
        })

        it('Should fail update user data with bad name', async () => {
            const { body } = await supertest(app.server)
                .post('/api/v1/admin/update-user')
                .set('Authorization', superAdminJwt)
                .set('user-agent', "Test")
                .send({ ...updateUserDataRequest, name: "anjing", userid: newlyRegisteredUserId })
                .expect(500)

            expect(body.message).toEqual("Banned words name")
        });

        it('Should fail to update user email with existent email', async () => {
            const { body } = await supertest(app.server)
                .post('/api/v1/admin/update-user')
                .set('Authorization', superAdminJwt)
                .set('user-agent', "Test")
                .send({ ...updateUserDataRequest, email: "user.admin@gmail.com", userid: newlyRegisteredUserId })
                .expect(500)

            expect(body.message).toEqual("Email is not available")
        })

        it('Should fail update/change user password', async () => {
            const changeUserPasswordRequest = {
                userid: newlyRegisteredUserId,
                password: "passwordBaru",
                confirmPassword: "salahconfirm"
            }

            const { body } = await supertest(app.server)
                .post('/api/v1/admin/change-user-pass')
                .set('Authorization', superAdminJwt)
                .set('user-agent', "Test")
                .send(changeUserPasswordRequest)
                .expect(500)

            expect(body.message).toEqual("Invalid Confirm Password")
        });
    })

    describe('Managing deleted user', () => {

        it('Should delete newly created user', async () => {
            const { body } = await supertest(app.server)
                .post('/api/v1/admin/delete-user')
                .set('Authorization', superAdminJwt)
                .set('user-agent', "Test")
                .send({ email: "rakhaUserManager.tokopaedi@gmail.com" })

            expect(typeof body.message).toEqual('boolean')
            expect(body.message).toBe(true)
        });

        it('Should return a deleted user list', async () => {
            const deletedUserListRequest = {
                lastId: 0,
                limit: 1,
                search: "({isDeleted}=1)",
                sort: "ASC"
            }

            const { body } = await supertest(app.server)
                .post('/api/v1/admin/user-list')
                .set('Authorization', superAdminJwt)
                .set('user-agent', "Test")
                .send(deletedUserListRequest)

            //extract the data
            const data = body.message.data
            const firstData = data[0]
            const userStatus = firstData[4]

            //extract the id
            newlyRegisteredUserId = firstData[0]

            expect(userStatus).toEqual("Deleted")
            expect(body.message.column).toEqual(userListColumnNames)
        });

        it('Should restore deleted user', async () => {
            const { body } = await supertest(app.server)
                .post('/api/v1/admin/restore-deleted-user')
                .set('Authorization', superAdminJwt)
                .set('user-agent', "Test")
                .send({ user_id: newlyRegisteredUserId })
                .expect(200)

            expect(body.message).toEqual(true)
        });

        it('Should check expired account (unverified)', async () => {
            //final step
            //hard delete, delete the account from database entirely, including data in the other table that has relation to the account (transaction, shipping address, etc.)
            const response = await AdminAppService.CheckExpiredAccount()
            expect(response).toEqual(true)
        })
    })
})