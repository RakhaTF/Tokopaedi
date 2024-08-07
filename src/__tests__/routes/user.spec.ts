import buildServer from "../../index"
import { expect, beforeAll, afterAll, describe, it, } from 'vitest'
import supertest from "supertest"
import AdminDomainService from "../../../src/domain/service/AdminDomainService"
import dotenvFlow from 'dotenv-flow';
import path from "path";
import { AppDataSource } from "../../infrastructure/mysql/connection"

//configuration for dotenv
dotenvFlow.config({ path: path.resolve(__dirname, `../../../`) });

describe.sequential('Lists of routes accessible to regular user (level 3)', () => {
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
            city: "Jakarta Utara",
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

    const wishlistedProductListColumnName = [
        "id",
        "name",
        "description",
        "price",
        "img_src",
        "public_id",
        "rating",
        "review_count"
    ]

    describe.sequential('Auth routes', () => {
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
                .expect(400)

            expect(body.message).toEqual("PLEASE_VERIFY_YOUR_EMAIL_FIRST")
        })

        it('Should verify newly registered user', async () => {

            //fetch token from newlyRegistered user from database.
            const token = await AppDataSource.query(`SELECT email_token from user WHERE email = ? ORDER BY created_at DESC LIMIT 1 `, [newlyRegisteredUserData.email])
            const email_token = token[0].email_token

            const { body } = await supertest(app.server)
                .get(`/api/v1/auth/verify-email/?token=${email_token}`)
                .set('user-agent', "Test")

            expect(body.message).toBe(true)
        }, { timeout: 20000 });

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

    describe.sequential('User interacting with user endpoints', () => {

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

    describe.sequential('User interacting with shipping address endpoints', () => {
        it('Should create a new shipping address', async () => {


            const newShippingAddressData = {
                address: "Jl. In Aja",
                city: "Jakarta Utara",
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
                city: "Indramayu",
                province: "Jawa Barat",
                postal_code: "45211",
                country: "Germany"
            }

            const { body } = await supertest(app.server)
                .post('/api/v1/user/shipping-address/update')
                .set('Authorization', newlyRegisteredUserJWTToken)
                .set('user-agent', "Test")
                .send(updateShippingAddressData)

            expect(typeof body.message).toEqual('boolean')
            expect(body.message).toEqual(true)
        });

        describe.sequential('Tests for failed scenario in shipping address endpoint', () => {
            describe.sequential('Should return error when fetching shipping address list with wrong pagination arguments format', () => {
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

    describe.sequential('User interacting with transaction endpoints', () => {
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

    describe.sequential('User interacting with review endpoints', () => {
        const newReviewData = {
            product_id: 1,
            rating: 5,
            comment: 'Nice product, would recommend it to my friends and family'
        }

        it('Should create a review of a product', async () => {
            const { body } = await supertest(app.server)
                .post('/api/v1/user/review/create')
                .set('Authorization', newlyRegisteredUserJWTToken)
                .set('user-agent', "Test")
                .send(newReviewData)

            expect(body.message).toEqual(true)
        })
    })

    describe.sequential('User interacting with wishlist endpoints', () => {
        const newCollection = {
            id: 0, // will be updated later after collection list fetch.
            name: "New Collection"
        }

        const wishlistedProduct = [
            1,
            "iPhone 9",
            "An apple mobile which is nothing like apple",
            "549.00",
            "https://res.cloudinary.com/dizgcsbsq/image/upload/v1704712309/tokopaedi/products/iphone-9.jpg",
            "tokopaedi/products/iphone-9.jpg",
            "4.00000",
            "1"
        ]

        it('Should be able to create a new wishlist collection', async () => {
            const { body } = await supertest(app.server)
                .post('/api/v1/user/wishlist/collection/create')
                .set('Authorization', newlyRegisteredUserJWTToken)
                .set('user-agent', "Test")
                .send({ name: newCollection.name })

            expect(body.message).toEqual(true)
        })

        it('Should return a list of user wishlist collection', async () => {
            const { body } = await supertest(app.server)
                .get('/api/v1/user/wishlist/collection/list')
                .set('Authorization', newlyRegisteredUserJWTToken)
                .set('user-agent', "Test")

            // extract the data
            const data = body.message

            // extracting newlyCreated collection data to test.
            const newData = data.filter((data) => data.name === newCollection.name)

            // assign the id to the newCollection object.
            newCollection.id = newData[0].id

            expect(typeof newData).toEqual('object')

            expect(newData[0]).toHaveProperty("name", newCollection.name)
        })

        it('Should be able to update the name of the new wishlist collection', async () => {
            const { body } = await supertest(app.server)
                .post('/api/v1/user/wishlist/collection/update')
                .set('Authorization', newlyRegisteredUserJWTToken)
                .set('user-agent', "Test")
                .send({ collection_id: newCollection.id, name: "Collection just updated" })

            expect(body.message).toEqual(true)
        })

        it('Should return the detail of a product that has not been wishlisted (logged in)', async () => {
            const { body } = await supertest(app.server)
                .post('/api/v1/user/product/detail')
                .set('Authorization', newlyRegisteredUserJWTToken)
                .set('user-agent', "Test")
                .send({ id: 1 })

            // extracting the data
            const data = body.message

            //expect that the product not yet wishlisted.
            expect(data.is_wishlisted).toEqual(false)
        })

        it('Should be able to wishlist a product (add product to wishlist)', async () => {
            const { body } = await supertest(app.server)
                .post('/api/v1/user/wishlist/collection/product/add')
                .set('Authorization', newlyRegisteredUserJWTToken)
                .set('user-agent', "Test")
                .send({ collection_id: newCollection.id, product_id: 1 })

            expect(body.message).toEqual(true)
        })

        it('Should return the detail of a product that has been wishlisted (logged in)', async () => {
            const { body } = await supertest(app.server)
                .post('/api/v1/user/product/detail')
                .set('Authorization', newlyRegisteredUserJWTToken)
                .set('user-agent', "Test")
                .send({ id: 1 })

            // extracting the data
            const data = body.message

            //expect that the product is wishlisted.
            expect(data.is_wishlisted).toEqual(true)
        })

        it('Should return a list of products inside a collection', async () => {
            const { body } = await supertest(app.server)
                .post('/api/v1/user/wishlist/collection/product/list')
                .set('Authorization', newlyRegisteredUserJWTToken)
                .set('user-agent', "Test")
                .send({ id: newCollection.id })

            // extracting the data
            const data = body.message.data

            const firstData = data[0]

            expect(firstData[0]).toEqual(wishlistedProduct[0])
            expect(firstData[1]).toEqual(wishlistedProduct[1])
            expect(firstData[2]).toEqual(wishlistedProduct[2])

            expect(body.message).toHaveProperty("hasNext", false)
            expect(body.message).toHaveProperty("currentPageDataCount", 1)
            expect(body.message).toHaveProperty("column", wishlistedProductListColumnName)
            wishlistedProductListColumnName.forEach(element => expect(body.message.column).toContain(element))

            paginationResponseBodyProperty.forEach(element => expect(body.message).toHaveProperty(element))
        })

        it('Should be able to remove a product from a wishlist', async () => {
            const { body } = await supertest(app.server)
                .post('/api/v1/user/wishlist/collection/product/delete')
                .set('Authorization', newlyRegisteredUserJWTToken)
                .set('user-agent', "Test")
                .send({ collection_id: newCollection.id, product_id: 1 })

            expect(body.message).toEqual(true)
        })

        it('Should delete the newly created collection', async () => {
            const { body } = await supertest(app.server)
                .post('/api/v1/user/wishlist/collection/delete')
                .set('Authorization', newlyRegisteredUserJWTToken)
                .set('user-agent', "Test")
                .send({ collection_id: newCollection.id })

            expect(body.message).toEqual(true)
        })
    })

    describe.sequential('User interacting with public product endpoints (no auth needed)', () => {
        describe('Should return a list of products with filter', () => {
            it('Price filter min & max', async () => {
                //sample of requestBody.
                const reqBody = {
                    limit: 5,
                    lastId: 0,
                    priceMin: 200,
                    priceMax: 600
                }
                //extract the response body.
                const { body } = await supertest(app.server)
                    .post('/api/v1/product/list')
                    .send(reqBody)
                    .expect(200)

                //extract the data
                const data = body.message.data

                const dataLength = data.length

                // expecting data length to be <= limit sent to the request.
                expect(dataLength).toBeLessThanOrEqual(5)

                // extract the prices of all product listed.
                const prices = data.map((prod) => prod[4])

                // expecting the price of each product to be between the min and max price.
                prices.forEach(price => expect(Number(price)).toBeLessThanOrEqual(reqBody.priceMax))
                prices.forEach(price => expect(Number(price)).toBeGreaterThanOrEqual(reqBody.priceMin))
            })

            it('Single price filter: minPrice', async () => {
                //sample of requestBody.
                const reqBody = {
                    limit: 5,
                    lastId: 0,
                    priceMin: 200,
                }
                //extract the response body.
                const { body } = await supertest(app.server)
                    .post('/api/v1/product/list')
                    .send(reqBody)
                    .expect(200)

                //extract the data
                const data = body.message.data

                const dataLength = data.length

                // expecting data length to be <= limit sent to the request.
                expect(dataLength).toBeLessThanOrEqual(5)

                // extract the prices of all product listed.
                const prices = data.map((prod) => prod[4])

                // expecting the price of each product to be between the min and max price.
                prices.forEach(price => expect(Number(price)).toBeGreaterThanOrEqual(reqBody.priceMin))
            })

            it('Single price filter: maxPrice', async () => {
                //sample of requestBody.
                const reqBody = {
                    limit: 5,
                    lastId: 0,
                    priceMax: 1000,
                }
                //extract the response body.
                const { body } = await supertest(app.server)
                    .post('/api/v1/product/list')
                    .send(reqBody)
                    .expect(200)

                //extract the data
                const data = body.message.data

                const dataLength = data.length

                // expecting data length to be <= limit sent to the request.
                expect(dataLength).toBeLessThanOrEqual(5)

                // extract the prices of all product listed.
                const prices = data.map((prod) => prod[4])

                // expecting the price of each product to be between the min and max price.
                prices.forEach(price => expect(Number(price)).toBeLessThanOrEqual(reqBody.priceMax))
            })

            it('Electronics category filter', async () => {
                const electronicsSubCategory = ["Smartphones", "Laptops", "Computers & Accessories"]

                //sample of requestBody.
                const reqBody = {
                    limit: 5,
                    lastId: 0,
                    categoriesFilter: "Electronics"
                }
                //extract the response body.
                const { body } = await supertest(app.server)
                    .post('/api/v1/product/list')
                    .send(reqBody)
                    .expect(200)

                //extract the data
                const data = body.message.data

                const dataLength = data.length

                // expecting data length to be <= limit sent to the request.
                expect(dataLength).toBeLessThanOrEqual(5)

                // extract the categories name of all product fetched.
                const categoriesName = data.map((prod) => prod[3])

                // Check if each category name is included in the electronicsSubCategory array
                categoriesName.forEach(catName => expect(electronicsSubCategory).toContain(catName))
            })

            it('Sort filter: highestRating', async () => {
                //sample of requestBody.
                const reqBody = {
                    limit: 10,
                    lastId: 0,
                    sortFilter: "highestRating",
                }
                //extract the response body.
                const { body } = await supertest(app.server)
                    .post('/api/v1/product/list')
                    .send(reqBody)
                    .expect(200)

                //extract the data
                const data = body.message.data
                const dataLength = data.length

                const firstData = data[0]
                const lastData = data[dataLength - 1]

                // extract the rating
                const firstDataRating = firstData[6]
                const lastDataRating = lastData[6]

                expect(Number(firstDataRating)).toBeGreaterThanOrEqual(Number(lastDataRating))

                // expecting data length to be <= limit sent to the request.
                expect(dataLength).toBeLessThanOrEqual(10)
            })

            it('Sort filter: lowestRating', async () => {
                //sample of requestBody.
                const reqBody = {
                    limit: 10,
                    lastId: 0,
                    sortFilter: "lowestRating",
                }
                //extract the response body.
                const { body } = await supertest(app.server)
                    .post('/api/v1/product/list')
                    .send(reqBody)
                    .expect(200)

                //extract the data
                const data = body.message.data
                const dataLength = data.length

                const firstData = data[0]
                const lastData = data[dataLength - 1]

                // extract the rating
                const firstDataRating = firstData[6]
                const lastDataRating = lastData[6]

                expect(Number(firstDataRating)).toBeLessThanOrEqual(Number(lastDataRating))

                // expecting data length to be <= limit sent to the request.
                expect(dataLength).toBeLessThanOrEqual(10)
            })

            it('Sort filter: mostReviewed', async () => {
                //sample of requestBody.
                const reqBody = {
                    limit: 10,
                    lastId: 0,
                    sortFilter: "mostReviewed",
                }
                //extract the response body.
                const { body } = await supertest(app.server)
                    .post('/api/v1/product/list')
                    .send(reqBody)

                //extract the data
                const data = body.message.data
                const dataLength = data.length

                const firstData = data[0]
                const lastData = data[dataLength - 1]

                // extract the review count
                const firstDataRevCount = firstData[7]
                const lastDataRevCount = lastData[7]

                expect(Number(firstDataRevCount)).toBeGreaterThanOrEqual(Number(lastDataRevCount))

                // expecting data length to be <= limit sent to the request.
                expect(dataLength).toBeLessThanOrEqual(10)
            })
        })
    })

    describe.sequential('Final step to delete created data', () => {
        it('Should delete the shipping address', async () => {

            const { body } = await supertest(app.server)
                .post('/api/v1/user/shipping-address/delete')
                .set('Authorization', newlyRegisteredUserJWTToken)
                .set('user-agent', "Test")
                .send({ id: newlyCreatedShippingAddressId })

            expect(typeof body.message).toEqual('boolean')
            expect(body.message).toEqual(true)
        });

        it.sequential('Should delete newly created review', async () => {
            // fetch the id of newly created review directly from database
            const review_id = await AppDataSource.query(`SELECT id from product_review WHERE user_id = ?`, [newlyRegisteredUserId])
            const id = review_id[0].id
            const { body } = await supertest(app.server)
                .post('/api/v1/user/review/delete')
                .set('Authorization', newlyRegisteredUserJWTToken)
                .set('user-agent', "Test")
                .send({ id })
                .expect(200)

            expect(body.message).toEqual(true)
        })

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

    describe.sequential('Fail test scenario', () => {
        describe.sequential('Auth routes', () => {
            it('Should fail to register with "SuperAdmin" as name', async () => {
                const { body } = await supertest(app.server)
                    .post('/api/v1/auth/register')
                    .send({ ...newUserData, name: "SuperAdmin" })
                    .expect(400)

                expect(body.message).toEqual("YOUR_NAME_CONTAINS_CONTENT_THAT_DOES_NOT_MEET_OUR_COMMUNITY_STANDARDS_PLEASE_REVISE_YOUR_NAME")
            })

            it('Should fail to register with bad word as name', async () => {
                const { body } = await supertest(app.server)
                    .post('/api/v1/auth/register')
                    .send({ ...newUserData, name: "anjing" })
                    .expect(400)

                expect(body.message).toEqual("YOUR_NAME_CONTAINS_CONTENT_THAT_DOES_NOT_MEET_OUR_COMMUNITY_STANDARDS_PLEASE_REVISE_YOUR_NAME")
            })

            it('Should fail to login after user has been deleted', async () => {
                const { body } = await supertest(app.server)
                    .post('/api/v1/auth/login')
                    .set('user-agent', "Test")
                    .send({ email: updateUserData.email, password: changePasswordRequest.newPassword })
                    .expect(404)

                expect(body.message).toEqual("ACCOUNT_NOT_FOUND")
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
                .expect(400)

            expect(typeof body).toEqual('object')
            expect(body.message).toEqual("YOUR_NAME_CONTAINS_CONTENT_THAT_DOES_NOT_MEET_OUR_COMMUNITY_STANDARDS_PLEASE_REVISE_YOUR_NAME")
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
                .expect(400)

            expect(typeof body).toEqual('object')
            expect(body.message).toEqual("EMAIL_IS_NOT_AVAILABLE_TO_USE")
        })

        it('Should fail to update password with INVALID_OLD_PASSWORD', async () => {
            changePasswordRequest = {
                oldPassword: 'passwordbaru',
                newPassword: 'password1234',
            }

            const { body } = await supertest(app.server)
                .post('/api/v1/user/change-pass')
                .set('Authorization', newlyRegisteredUserJWTToken)
                .set('user-agent', "Test")
                .send(changePasswordRequest)
                .expect(400)

            expect(typeof body).toEqual('object')
            expect(body.message).toEqual("INVALID_OLD_PASSWORD")
        })

        it('Should fail accessing route without login', async () => {
            const { body } = await supertest(app.server)
                .get('/api/v1/user/profile')
                .expect(401)

            expect(body.message).toEqual("PLEASE_LOGIN_FIRST")
        })

        it('Should fail accessing admin route', async () => {
            const { body } = await supertest(app.server)
                .get('/api/v1/admin/rules/list')
                .set('Authorization', newlyRegisteredUserJWTToken)
                .set('user-agent', "Test")
                .expect(401)

            expect(body.message).toEqual("NOT_ENOUGH_RIGHTS")
        })

        it('Should fail to create a review with bad words', async () => {
            const newReviewData = {
                product_id: 1,
                rating: 5,
                comment: 'produk jelek anjing'
            }

            const { body } = await supertest(app.server)
                .post('/api/v1/user/review/create')
                .set('Authorization', newlyRegisteredUserJWTToken)
                .set('user-agent', "Test")
                .send(newReviewData)
                .expect(400)

            expect(typeof body).toEqual('object')
            expect(body.message).toEqual("YOUR_REVIEW_CONTAINS_CONTENT_THAT_DOES_NOT_MEET_OUR_COMMUNITY_STANDARDS_PLEASE_REVISE_YOUR_COMMENT")
        })

        it('Should fail to delete non existent review', async () => {
            const { body } = await supertest(app.server)
                .post('/api/v1/user/review/delete')
                .set('Authorization', newlyRegisteredUserJWTToken)
                .set('user-agent', "Test")
                .send({ id: 696969 })
                .expect(400)

            expect(typeof body).toEqual('object')
            expect(body.message).toEqual("REVIEW_NOT_FOUND")
        })

        it('Should fail to delete other user review', async () => {
            const { body } = await supertest(app.server)
                .post('/api/v1/user/review/delete')
                .set('Authorization', newlyRegisteredUserJWTToken)
                .set('user-agent', "Test")
                .send({ id: 10 })
                .expect(400)

            expect(typeof body).toEqual('object')
            expect(body.message).toEqual("THIS_REVIEW_DOES_NOT_BELONG_TO_YOU")
        })

        it('Should fail to fetch product list with invalid min & max price filter', async () => {
            //sample of requestBody.
            const reqBody = {
                limit: 5,
                lastId: 0,
                priceMax: 200,
                priceMin: 600
            }
            //extract the response body.
            const { body } = await supertest(app.server)
                .post('/api/v1/product/list')
                .send(reqBody)
                .expect(400)

            expect(body.message).toEqual("MAX_PRICE_SHOULD_BE_GREATER_THAN_MIN_PRICE")
        })
    })
}, { timeout: 20000 })