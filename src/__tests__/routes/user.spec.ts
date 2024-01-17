import buildServer from "../../index"
import { expect, beforeAll, afterAll, describe, it, } from 'vitest'
import supertest from "supertest"
import { signJWT } from "../../helpers/jwt/jwt"
import AdminDomainService from "../../../src/domain/service/AdminDomainService"

describe('Lists of routes accessible to regular user (level 3)', () => {
    let app;
    let superAdminJwt: string;
    let newUserData;
    let newShippingAddressData;
    let newlyRegisteredUserData;
    let newlyRegisteredUserJWTToken: string;
    let newlyRegisteredUserId: number;
    let newlyCreatedShippingAddressId: number;
    let updateUserData;
    let changePasswordRequest;

    beforeAll(async () => {
        app = await buildServer()
        await app.ready();
        superAdminJwt = process.env.SUPER_ADMIN_JWT as string;
        newUserData = {
            name: "Rakha",
            email: "rakharan@gmail.com",
            password: "12345678",
        };
        newShippingAddressData = {
            address: "Jl. In Aja",
            city: "Jakarta",
            province: "DKI Jakarta",
            postal_code: "45211",
            country: "Indonesia",
        };
    })

    afterAll(async () => {
        await app.close()
        //hard delete, delete the account from database entirely, including data in the other table that has relation to the account (transaction, shipping address, etc.)
        await AdminDomainService.HardDeleteUserDomain(newlyRegisteredUserId)
    })

    const userColumnName = ["id",
        "name",
        "email",
        "created_at",
        "is_deleted"
    ]

    const shippingAddressColumnName = [
        "id",
        "user_id",
        "address",
        "postal_code",
        "city",
        "province",
        "country"
    ]

    const transactionColumnName = [
        "id",
        "user_id",
        "payment_method",
        "items_price",
        "shipping_price",
        "total_price",
        "shipping_address_id", "is_paid",
        "paid_at",
        "created_at",
        "updated_at"
    ]

    const paginationResponseBodyProperty = [
        'data',
        'column',
        'lastId',
        'hasNext',
        'currentPageDataCount'
    ]

    describe('Auth routes', () => {
        it('Should register new user', async () => {

            const { body } = await supertest(app.server)
                .post('/api/v1/auth/register')
                .send(newUserData)

            newlyRegisteredUserData = body.message
            expect(body.message).toHaveProperty("id")
            expect(body.message).toHaveProperty("name")
            expect(body.message).toHaveProperty("email")
            expect(body.message).toHaveProperty("level")
            expect(body.message).toHaveProperty("created_at")

        })

        //Fetch newly registered user data and assign the data into a variable for further tests.
        it('Should return list of users in ascending order with name filter of newly registered user', async () => {

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

            const newlyRegisteredUserDatafromList = data[0]

            //extract the data
            const userName = newlyRegisteredUserDatafromList[1]
            const userEmail = newlyRegisteredUserDatafromList[2]

            expect(data).toHaveLength(1)
            expect(body.message.column).toHaveLength(5)
            userColumnName.forEach(element => expect(body.message.column).toContain(element))
            paginationResponseBodyProperty.forEach(element => expect(body.message).toHaveProperty(element))
            expect(body.message).toHaveProperty("currentPageDataCount", 1)

            expect(userName).toEqual(newUserData.name)
            expect(userEmail).toEqual(newUserData.email)
        });

        it('Should fail to login before account is verified', async () => {
            const { body } = await supertest(app.server)
                .post('/api/v1/auth/login')
                .set('user-agent', "Test")
                .send({ email: newUserData.email, password: newUserData.password })
                .expect(500)

            expect(body.message).toEqual("Please verify your email first!")
        })

        it('Should verify newly registered user', async () => {

            const expiresIn = process.env.EXPIRES_IN || "1h"

            //Create an email token used to verify email.
            const email_token: string = await signJWT({ email: newlyRegisteredUserData.email }, process.env.JWT_SECRET as string, { expiresIn, noTimestamp: true })

            const { body } = await supertest(app.server)
                .get(`/api/v1/auth/verify-email/?token=${email_token}`)
                .set('user-agent', "Test")

            expect(body.message).toBe(true)
        });

        it('Should login newly registered user', async () => {

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
    })

    describe('User interacting with user endpoints', () => {

        it('Should return the detail of newly registered user', async () => {

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

            newlyRegisteredUserId = userData.id;

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

        it('Should update newly registered user', async () => {

            updateUserData = {
                email: "rakharan@gmail.com",
                name: "Rakha Update"
            }

            const { body } = await supertest(app.server)
                .post('/api/v1/user/profile/update')
                .set('Authorization', newlyRegisteredUserJWTToken)
                .set('user-agent', "Test")
                .send(updateUserData)
                .expect(200)

            expect(typeof body.message).toEqual('object')
            expect(body.message.email).toEqual(updateUserData.email)
            expect(body.message.name).toEqual(updateUserData.name)
        });

        it('Should update/change user pass', async () => {

            changePasswordRequest = {
                oldPassword: '12345678',
                newPassword: 'password1234',
            }

            const { body } = await supertest(app.server)
                .post('/api/v1/user/change-pass')
                .set('Authorization', newlyRegisteredUserJWTToken)
                .set('user-agent', "Test")
                .send(changePasswordRequest)
                .expect(200)

            expect(body.message).toEqual(true)
            expect(typeof body.message).toEqual('boolean')
        });

        it('Should be able to login after password change/update', async () => {

            const { body } = await supertest(app.server)
                .post('/api/v1/auth/login')
                .set('user-agent', "Test")
                .send({ email: updateUserData.email, password: changePasswordRequest.newPassword })

            //extract the user data
            const userData = body.message.user

            expect(body.message).toHaveProperty("token")
            expect(body.message).toHaveProperty("user")

            expect(userData.name).toEqual(updateUserData.name)
            expect(userData.email).toEqual(updateUserData.email)
            expect(userData.authority).toEqual([])
        })

    })

    describe('User interacting with shipping address endpoints', () => {
        it('Should create a new shipping address', async () => {


            const newShippingAddressData = {
                address: "Jl. In Aja",
                city: "Jakarta",
                province: "DKI Jakarta",
                postal_code: "45211",
                country: "Indonesia",
            }

            const { body } = await supertest(app.server)
                .post('/api/v1/user/shipping-address/create')
                .set('Authorization', newlyRegisteredUserJWTToken)
                .set('user-agent', "Test")
                .send(newShippingAddressData)
                .expect(200)

            expect(body.message).toBe(true)
        });

        it(`Should return a list of user's shipping address`, async () => {

            const shippingAddressListRequest = {
                limit: 1,
                lastId: 0,
                search: "",
                sort: "DESC"
            }

            const { body } = await supertest(app.server)
                .post('/api/v1/user/shipping-address/list')
                .set('Authorization', newlyRegisteredUserJWTToken)
                .set('user-agent', "Test")
                .send(shippingAddressListRequest)
                .expect(200)

            //extract the data:
            const data = body.message.data
            const firstData = data[0]

            newlyCreatedShippingAddressId = firstData[0]

            const address = firstData[2]
            const postal_code = firstData[3]
            const city = firstData[4]
            const province = firstData[5]
            const country = firstData[6]


            expect(data).toHaveLength(1)
            expect(address).toEqual(newShippingAddressData.address)
            expect(postal_code).toEqual(newShippingAddressData.postal_code)
            expect(city).toEqual(newShippingAddressData.city)
            expect(province).toEqual(newShippingAddressData.province)
            expect(country).toEqual(newShippingAddressData.country)

            expect(body.message).toHaveProperty("hasNext", false)
            expect(body.message).toHaveProperty("currentPageDataCount", 1)
            expect(body.message).toHaveProperty("column", shippingAddressColumnName)
            shippingAddressColumnName.forEach(element => expect(body.message.column).toContain(element))
        });

        it('Should return the detail of newly created shipping address', async () => {


            const { body } = await supertest(app.server)
                .post('/api/v1/user/shipping-address/detail')
                .set('Authorization', newlyRegisteredUserJWTToken)
                .set('user-agent', "Test")
                .send({ id: newlyCreatedShippingAddressId })
                .expect(200)

            shippingAddressColumnName.forEach(element => expect(body.message).toHaveProperty(element))
            expect(body.message).toHaveProperty("address", newShippingAddressData.address)

            for (const key in newShippingAddressData) {
                expect(body.message).toHaveProperty(key, newShippingAddressData[key])
            }
        });

        it('Should update the newly created shipping address', async () => {

            const updateShippingAddressData = {
                id: newlyCreatedShippingAddressId,
                address: "Jl. Victory Gate",
                city: "Frankfurt",
                province: "West Europe",
                postal_code: "45211",
                country: "Germany Island"
            }

            const { body } = await supertest(app.server)
                .post('/api/v1/user/shipping-address/update')
                .set('Authorization', newlyRegisteredUserJWTToken)
                .set('user-agent', "Test")
                .send(updateShippingAddressData)

            expect(typeof body.message).toEqual('boolean')
            expect(body.message).toEqual(true)
        });

        describe('Tests for failed scenario in shipping address endpoint', () => {
            describe('Should return error when fetching shipping address list with wrong pagination arguments format', () => {
                it('Should return error with wrong lastId format', async () => {

                    const shippingAddressListRequest = {
                        limit: 1,
                        lastId: "asd",
                        search: "",
                        sort: "DESC"
                    }

                    const { body } = await supertest(app.server)
                        .post('/api/v1/user/shipping-address/list')
                        .set('Authorization', newlyRegisteredUserJWTToken)
                        .set('user-agent', "Test")
                        .send(shippingAddressListRequest)
                        .expect(400)

                    expect(typeof body).toEqual("object")
                    expect(body.message).toEqual("body/lastId must be integer")
                    expect(body.error).toEqual("Bad Request")
                });

                it('Should return error with wrong sort', async () => {

                    const shippingAddressListRequest = {
                        limit: 1,
                        lastId: 0,
                        search: "",
                        sort: "UP"
                    }

                    const { body } = await supertest(app.server)
                        .post('/api/v1/user/shipping-address/list')
                        .set('Authorization', newlyRegisteredUserJWTToken)
                        .set('user-agent', "Test")
                        .send(shippingAddressListRequest)
                        .expect(500)

                    expect(typeof body).toEqual("object")
                    expect(body.error).toEqual("Internal Server Error")
                    expect(body.message).toEqual("sort must be either ASC or DESC")
                });
            })
        })

    })

    describe('User interacting with transaction endpoints', () => {
        const newTransactionRequestData = {
            product_id: [2, 3, 4],
            qty: [10, 10, 10]
        }

        const transactionDetailColumnNames = [
            "user_id",
            "transaction_id",
            "name",
            "product_bought",
            "items_price",
            "shipping_price",
            "total_price",
            "is_paid",
            "paid_at",
            "transaction_status",
            "delivery_status",
            "shipping_address",
            "created_at",
            "expire_at"
        ]

        let newlyCreatedTxId: number;

        it('Should create new transaction', async () => {

            const { body } = await supertest(app.server)
                .post('/api/v1/user/transaction/create')
                .set('Authorization', newlyRegisteredUserJWTToken)
                .set('user-agent', "Test")
                .send(newTransactionRequestData)

            expect(body.message).toBe(true)
        });

        it('Should return the lists of user transaction', async () => {

            const reqBody = {
                limit: 1,
                lastId: 0,
                sort: "ASC",
            }

            const { body } = await supertest(app.server)
                .post('/api/v1/user/transaction/list')
                .set('Authorization', newlyRegisteredUserJWTToken)
                .set('user-agent', "Test")
                .send(reqBody)
                .expect(200)

            //extract the data
            const data = body.message.data

            //extract the id.
            newlyCreatedTxId = data[0][0]

            expect(data).toHaveLength(1)
            expect(body.message.column).toHaveLength(11)
            transactionColumnName.forEach(element => expect(body.message.column).toContain(element))
            paginationResponseBodyProperty.forEach(element => expect(body.message).toHaveProperty(element))
            expect(body.message).toHaveProperty("currentPageDataCount", 1)
            expect(body.message).toHaveProperty("lastId", 0)
        });

        it('Should return the detail of newly created transaction', async () => {

            const productBoughtDetail = [
                {
                    "product_name": "iPhone X",
                    "qty": "10"
                },
                {
                    "product_name": "Samsung Universe 9",
                    "qty": "10"
                },
                {
                    "product_name": "OPPOF19",
                    "qty": "10"
                }
            ]

            const { body } = await supertest(app.server)
                .post('/api/v1/user/transaction/detail')
                .set('Authorization', newlyRegisteredUserJWTToken)
                .set('user-agent', "Test")
                .send({ id: newlyCreatedTxId })
                .expect(200)

            //extract the data
            const data = body.message

            const name = data.name
            const productBought = data.product_bought
            const itemsPrice = data.items_price
            const shippingPrice = data.shipping_price

            const isPaid = data.is_paid
            const transactionStatus = data.transaction_status
            const deliveryStatus = data.delivery_status

            expect(name).toEqual("Rakha Update")
            expect(productBought).toEqual(productBoughtDetail)
            expect(itemsPrice).toEqual(24280)
            expect(shippingPrice).toEqual(0)
            expect(itemsPrice + shippingPrice).toEqual(24280)

            expect(isPaid).toEqual("Unpaid")
            expect(transactionStatus).toEqual("Pending")
            expect(deliveryStatus).toEqual("Delivery Status Not Available")

            //loop to check that body have all the column names as property
            transactionDetailColumnNames.forEach(element => expect(body.message).toHaveProperty(element))
        });

        it('Should update the quantity of products of a newly created transaction', async () => {
            const updateTransactionProductQtyRequest = {
                order_id: newlyCreatedTxId,
                product_id: 3,
                qty: 5
            }

            const { body } = await supertest(app.server)
                .post('/api/v1/user/transaction/update-product-quantity')
                .set('Authorization', newlyRegisteredUserJWTToken)
                .set('user-agent', "Test")
                .send(updateTransactionProductQtyRequest)

            expect(body.message).toEqual(true)
        });

        it('Should return the detail of newly updated transaction', async () => {
            const updatedProductBoughtDetail = [
                {
                    "product_name": "iPhone X",
                    "qty": "10"
                },
                {
                    "product_name": "Samsung Universe 9",
                    "qty": "5"
                },
                {
                    "product_name": "OPPOF19",
                    "qty": "10"
                }
            ]

            const { body } = await supertest(app.server)
                .post('/api/v1/user/transaction/detail')
                .set('Authorization', newlyRegisteredUserJWTToken)
                .set('user-agent', "Test")
                .send({ id: newlyCreatedTxId })
                .expect(200)

            //extract the data
            const data = body.message

            const name = data.name
            const productBought = data.product_bought

            expect(name).toEqual("Rakha Update")
            expect(productBought).toEqual(updatedProductBoughtDetail)

            //loop to check that body have all the column names as property
            transactionDetailColumnNames.forEach(element => expect(body.message).toHaveProperty(element))
        });

        it('Should pay the transaction', async () => {

            const payTransactionRequest = {
                transaction_id: newlyCreatedTxId,
                user_id: newlyRegisteredUserId,
                payment_method: "Credit Card",
                shipping_address_id: newlyCreatedShippingAddressId,
                expedition_name: "JNE",
            }

            const { body } = await supertest(app.server)
                .post('/api/v1/user/transaction/pay')
                .set('Authorization', newlyRegisteredUserJWTToken)
                .set('user-agent', "Test")
                .send(payTransactionRequest)

            expect(body.message).toEqual(true)
        });
    })

    describe('Final step to delete created data', () => {
        it('Should delete the shipping address', async () => {

            const { body } = await supertest(app.server)
                .post('/api/v1/user/shipping-address/delete')
                .set('Authorization', newlyRegisteredUserJWTToken)
                .set('user-agent', "Test")
                .send({ id: newlyCreatedShippingAddressId })

            expect(typeof body.message).toEqual('boolean')
            expect(body.message).toEqual(true)
        });

        //final step.
        //Delete the user created in test.
        it('Should delete newly registered user', async () => {

            //Soft delete, just flag the account with 1 (true), in is_deleted column.
            const { body } = await supertest(app.server)
                .post('/api/v1/admin/delete-user')
                .set('Authorization', superAdminJwt)
                .set('user-agent', "Test")
                .send({ email: updateUserData.email })

            expect(typeof body.message).toEqual('boolean')
            expect(body.message).toBe(true)
        });
    })

    describe('Fail test scenario', () => {
        describe('Auth routes', () => {
            it('Should fail to register with "SuperAdmin" as name', async () => {
                const { body } = await supertest(app.server)
                    .post('/api/v1/auth/register')
                    .send({ ...newUserData, name: "SuperAdmin" })
                    .expect(500)

                expect(body.message).toEqual("You can't use this name!")
            })

            it('Should fail to register with bad word as name', async () => {
                const { body } = await supertest(app.server)
                    .post('/api/v1/auth/register')
                    .send({ ...newUserData, name: "anjing" })
                    .expect(500)

                expect(body.message).toEqual("You can't use this name!")
            })

            it('Should fail to login after user has been deleted', async () => {
                const { body } = await supertest(app.server)
                    .post('/api/v1/auth/login')
                    .set('user-agent', "Test")
                    .send({ email: updateUserData.email, password: changePasswordRequest.newPassword })
                    .expect(500)

                expect(body.message).toEqual("Your account is deleted, please contact an admin")
            })
        })

        it('Should fail to update user name to banned words', async () => {
            updateUserData = {
                email: "rakharan@gmail.com",
                name: "anjing"
            }

            const { body } = await supertest(app.server)
                .post('/api/v1/user/profile/update')
                .set('Authorization', newlyRegisteredUserJWTToken)
                .set('user-agent', "Test")
                .send(updateUserData)
                .expect(500)

            expect(typeof body).toEqual('object')
            expect(body.message).toEqual("Banned words name")
        })

        it('Should fail to update user with wrong email (used by others/existed)', async () => {
            updateUserData = {
                email: "user.admin@gmail.com",
                name: "randhika"
            }

            const { body } = await supertest(app.server)
                .post('/api/v1/user/profile/update')
                .set('Authorization', newlyRegisteredUserJWTToken)
                .set('user-agent', "Test")
                .send(updateUserData)
                .expect(500)

            expect(typeof body).toEqual('object')
            expect(body.message).toEqual("Email is not available")
        })

        it('Should fail to update password with invalid old password', async () => {
            changePasswordRequest = {
                oldPassword: 'passwordbaru',
                newPassword: 'password1234',
            }

            const { body } = await supertest(app.server)
                .post('/api/v1/user/change-pass')
                .set('Authorization', newlyRegisteredUserJWTToken)
                .set('user-agent', "Test")
                .send(changePasswordRequest)
                .expect(500)

            expect(typeof body).toEqual('object')
            expect(body.message).toEqual("Invalid old password")
        })

        it('Should fail accessing route without login', async () => {
            const { body } = await supertest(app.server)
                .get('/api/v1/user/profile')
                .expect(500)

            expect(body.message).toEqual("PLEASE_LOGIN_FIRST")
        })

        it('Should fail accessing admin route', async () => {
            const { body } = await supertest(app.server)
                .get('/api/v1/admin/rules/list')
                .set('Authorization', newlyRegisteredUserJWTToken)
                .set('user-agent', "Test")
                .expect(500)

            expect(body.message).toEqual("NOT_ENOUGH_RIGHTS")
        })
    })
})