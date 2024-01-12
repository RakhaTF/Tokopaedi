import buildServer from "../../index"
import { expect, beforeAll, afterAll, describe, it, } from 'vitest'
import supertest from "supertest"
import { signJWT } from "../../helpers/jwt/jwt"
let app


beforeAll(async () => {
    app = await buildServer()
})

afterAll(async () => {
    await app.close()
})

const superAdminJwt = process.env.SUPER_ADMIN_JWT as string


describe('Auth Routes', () => {

    const newUserData = {
        name: "Rakha",
        email: "rakharan@gmail.com",
        password: "12345678",
    }

    let newlyRegisteredUserData;

    let newlyRegisteredUserJWTToken: string;

    const userColumnName = ["id", "name", "email", "created_at", "is_deleted"]
    const paginationResponseBodyProperty = ['data', 'column', 'lastId', 'hasNext', 'currentPageDataCount']

    it('Should register new user', async () => {
        await app.ready()

        const { body } = await supertest(app.server)
            .post('/api/v1/auth/register')
            .send(newUserData)

        newlyRegisteredUserData = body.message.user
        expect(body.message).toHaveProperty("id")
        expect(body.message).toHaveProperty("name")
        expect(body.message).toHaveProperty("email")
        expect(body.message).toHaveProperty("level")
        expect(body.message).toHaveProperty("created_at")
    })

    it('Should return list of users in ascending order with name filter of newly registered user', async () => {
        await app.ready()

        const reqBody = {
            limit: 1,
            lastId: 0,
            sort: "ASC",
            search: `({name} = '${newUserData.name}')`
        }

        const { body } = await supertest(app.server)
            .post('/api/v1/admin/user-list')
            .set('Authorization', superAdminJwt)
            .set('user-agent', "Test")
            .send(reqBody)

        //extract the data
        const data = body.message.data

        newlyRegisteredUserData = data[0]

        //extract the data
        const userName = newlyRegisteredUserData[1]
        const userEmail = newlyRegisteredUserData[2]
        const userStatus = newlyRegisteredUserData[4]

        expect(data).toHaveLength(1)
        expect(body.message.column).toHaveLength(5)
        userColumnName.forEach(element => expect(body.message.column).toContain(element))
        paginationResponseBodyProperty.forEach(element => expect(body.message).toHaveProperty(element))
        expect(body.message).toHaveProperty("hasNext", false)
        expect(body.message).toHaveProperty("currentPageDataCount", 1)

        expect(userName).toEqual(newUserData.name)
        expect(userEmail).toEqual(newUserData.email)
        expect(userStatus).toEqual("Active")
    });

    it('Should verify newly registered user', async () => {
        await app.ready()

        const expiresIn = process.env.EXPIRES_IN || "1h"

        //Create an email token used to verify email.
        const email_token: string = await signJWT({ email: newUserData.email }, process.env.JWT_SECRET as string, { expiresIn })

        const { body } = await supertest(app.server)
            .get(`/api/v1/auth/verify-email/?token=${email_token}`)
            .set('user-agent', "Test")

        expect(body.message).toBe(true)
    });

    it('Should login newly registered user', async () => {
        await app.ready()

        const { body } = await supertest(app.server)
            .post('/api/v1/auth/login')
            .set('user-agent', "Test")
            .send({ email: newUserData.email, password: newUserData.password })

        //extract the user data
        const userData = body.message.user

        expect(body.message).toHaveProperty("token")
        expect(body.message).toHaveProperty("user")

        expect(userData.name).toEqual(newUserData.name)
        expect(userData.email).toEqual(newUserData.email)
        expect(userData.authority).toEqual([])

        newlyRegisteredUserJWTToken = body.message.token
    })

    it('Should return the detail of newly registered user', async () => {
        await app.ready()

        const { body } = await supertest(app.server)
            .get('/api/v1/user/profile')
            .set('Authorization', newlyRegisteredUserJWTToken)
            .set('user-agent', "Test")


            //extract the data
            const data = body.message
            const userData = {
                id: data.id,
                name: data.name,
                email: data.email,
                level: data.level,
                created_at: data.created_at,
            }

            expect(body.message).toHaveProperty("id")
            expect(body.message).toHaveProperty("name")
            expect(body.message).toHaveProperty("email")
            expect(body.message).toHaveProperty("level")
            expect(body.message).toHaveProperty("created_at")

            expect(userData.name).toEqual(newUserData.name)
            expect(userData.email).toEqual(newUserData.email)

            expect(userData.level).toEqual(3)
            expect(typeof userData.created_at).toEqual('number')
    });

    it('Should delete newly registered user', async () => {
        await app.ready()

        const { body } = await supertest(app.server)
            .post('/api/v1/admin/delete-user')
            .set('Authorization', superAdminJwt)
            .set('user-agent', "Test")
            .send({ email: newUserData.email })

        expect(body.message).toBe(true)
    });

})