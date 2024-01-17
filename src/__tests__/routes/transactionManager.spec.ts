import buildServer from "../../index"
import { expect, beforeAll, afterAll, describe, it, } from 'vitest'
import supertest from "supertest"
import TransactionDomainService from "../../domain/service/TransactionDomainService"
import ShippingAddressDomainService from "../../domain/service/ShippingAddressDomainService"

describe('List of routes accessible to transaction manager', () => {
    let app;
    let superAdminJwt: string;
    let newlyCreatedAddressId: number;
    let newlyCreatedTxId: number;

    beforeAll(async () => {
        app = await buildServer()
        await app.ready();
        superAdminJwt = process.env.SUPER_ADMIN_JWT as string;
    })

    afterAll(async () => {
        await app.close()
        //last step, cleanup created data from database.
        await TransactionDomainService.HardDeleteTransactionDomain(newlyCreatedTxId)
        await ShippingAddressDomainService.HardDeleteShippingAddressDomain(newlyCreatedAddressId)
    })

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

    it('Should fail to create transaction with out of stock product', async () => {
        const newTransactionRequestData = {
            product_id: [5, 6],
            qty: [10, 10]
        }

        const { body } = await supertest(app.server)
            .post('/api/v1/user/transaction/create')
            .set('Authorization', superAdminJwt)
            .set('user-agent', "Test")
            .send(newTransactionRequestData)
            .expect(500)

        expect(body.message).toEqual(`Product Huawei P30 is out of stock!`)
    })

    it('Should create a new transaction for testing', async () => {
        const newTransactionRequestData = {
            product_id: [7, 8],
            qty: [10, 10]
        }

        const { body } = await supertest(app.server)
            .post('/api/v1/user/transaction/create')
            .set('Authorization', superAdminJwt)
            .set('user-agent', "Test")
            .send(newTransactionRequestData)
            .expect(200)

        expect(body.message).toEqual(true)
    });

    describe('Fail test scenario', () => {

        it('Should fail to create another transaction if the previous transaction is unpaid', async () => {
            const newTransactionRequestData = {
                product_id: [7, 8],
                qty: [10, 10]
            }

            const { body } = await supertest(app.server)
                .post('/api/v1/user/transaction/create')
                .set('Authorization', superAdminJwt)
                .set('user-agent', "Test")
                .send(newTransactionRequestData)
                .expect(500)

            expect(body.message).toEqual("Please pay your current transaction.")
        })

        it('Should fail to create transaction with mismatch length of qty & prodcut_id', async () => {
            const newTransactionRequestData = {
                product_id: [7, 8, 9],
                qty: [10, 10]
            }

            const { body } = await supertest(app.server)
                .post('/api/v1/user/transaction/create')
                .set('Authorization', superAdminJwt)
                .set('user-agent', "Test")
                .send(newTransactionRequestData)
                .expect(500)

            expect(body.message).toEqual("Product_id and qty not match")
        })
    })

    it('Should create a new shipping address', async () => {
        const newShippingAddressData = {
            address: "Jl. In Aja Transaction",
            city: "Berlin",
            province: "Furth",
            postal_code: "45211",
            country: "Germany",
        }

        const { body } = await supertest(app.server)
            .post('/api/v1/user/shipping-address/create')
            .set('Authorization', superAdminJwt)
            .set('user-agent', "Test")
            .send(newShippingAddressData)
            .expect(200)

        expect(body.message).toEqual(true)
    });

    describe('Transaction manager interacting with shipping address endpoints', () => {

        it('Should return all users shipping address (list)', async () => {
            const allUserShippingAddressRequest = {
                limit: 1,
                lastId: 0,
                search: "",
                sort: "DESC"
            }

            const { body } = await supertest(app.server)
                .post('/api/v1/admin/user/shipping-address')
                .set('Authorization', superAdminJwt)
                .set('user-agent', "Test")
                .send(allUserShippingAddressRequest)
                .expect(200)

            //extract the data
            const data = body.message.data
            const columns = body.message.column
            newlyCreatedAddressId = data[0][0]

            expect(body.message).toHaveProperty("data")
            expect(body.message).toHaveProperty("column")
            expect(body.message).toHaveProperty("lastId")
            expect(body.message).toHaveProperty("currentPageDataCount", 1)

            shippingAddressColumnName.forEach((element) => expect(columns).toContain(element))
        });

        it('Should return a list of shipping address from a single user', async () => {
            const allUserShippingAddressRequest = {
                limit: 1,
                lastId: 0,
                search: "",
                sort: "DESC"
            }

            //fetch user shipping address list, we use 1 for userid because we are using superAdmin account for this test
            const { body } = await supertest(app.server)
                .post('/api/v1/admin/user/shipping-address/list')
                .set('Authorization', superAdminJwt)
                .set('user-agent', "Test")
                .send({ ...allUserShippingAddressRequest, user_id: 1 })
                .expect(200)

            //extract the data
            const columns = body.message.column

            expect(body.message).toHaveProperty("data")
            expect(body.message).toHaveProperty("column")
            expect(body.message).toHaveProperty("lastId")
            expect(body.message).toHaveProperty("currentPageDataCount", 1)

            shippingAddressColumnName.forEach((element) => expect(columns).toContain(element))
        });

    })

    describe('Transaction manager interacting with transaction endpoints', () => {

        it('Should return transaction list from all users', async () => {
            const reqBody = {
                limit: 1,
                lastId: 0,
                sort: "DESC",
                search: ""
            }

            const { body } = await supertest(app.server)
                .post('/api/v1/admin/transaction/list')
                .set('Authorization', superAdminJwt)
                .set('user-agent', "Test")
                .send(reqBody)

            //extract the data
            const data = body.message.data

            newlyCreatedTxId = data[0][0]
            expect(data).toHaveLength(1)

            expect(body.message).toHaveProperty("currentPageDataCount", 1)
            expect(body.message).toHaveProperty("lastId")

            transactionColumnName.forEach(element => expect(body.message.column).toContain(element))
            paginationResponseBodyProperty.forEach(element => expect(body.message).toHaveProperty(element))
        });

        it('Should return transaction list from a single user', async () => {
            const reqBody = {
                user_id: 1,
                limit: 1,
                lastId: 0,
                sort: "DESC",
                search: ""
            }

            const { body } = await supertest(app.server)
                .post('/api/v1/admin/user/transaction/list')
                .set('Authorization', superAdminJwt)
                .set('user-agent', "Test")
                .send(reqBody)

            expect(body.message).toHaveProperty("currentPageDataCount", 1)
            expect(body.message).toHaveProperty("lastId")

            transactionColumnName.forEach(element => expect(body.message.column).toContain(element))
            paginationResponseBodyProperty.forEach(element => expect(body.message).toHaveProperty(element))
        });

        it('Should pay the newly created transaction', async () => {
            const payTransactionRequest = {
                transaction_id: newlyCreatedTxId,
                user_id: 1,
                payment_method: "Credit Card",
                shipping_address_id: newlyCreatedAddressId,
                expedition_name: "JNE",
            }

            const { body } = await supertest(app.server)
                .post('/api/v1/user/transaction/pay')
                .set('Authorization', superAdminJwt)
                .set('user-agent', "Test")
                .send(payTransactionRequest)

            expect(body.message).toEqual(true)
        });

        it('Should fail to update the delivery status of an unapproved transaction', async () => {
            const updateDeliveryStatusRequest = {
                transaction_id: newlyCreatedTxId,
                is_delivered: 1, // 0 = pending, 1 = delivered
                status: 1, //0 = Pending, 1 = On Delivery, 2 = Delivered, 3 = Rejected
            }

            const { body } = await supertest(app.server)
                .post('/api/v1/admin/transaction/update-delivery-status')
                .set('Authorization', superAdminJwt)
                .set('user-agent', "Test")
                .send(updateDeliveryStatusRequest)
                .expect(500)

            expect(body.message).toEqual("Please approve the transaction first!")
        });

        it('Should approve a transaction', async () => {
            const { body } = await supertest(app.server)
                .post('/api/v1/admin/user/transaction/approve')
                .set('Authorization', superAdminJwt)
                .set('user-agent', "Test")
                .send({ transaction_id: newlyCreatedTxId })
                .expect(200)

            expect(body.message).toEqual(true)
        });

        it('Should update a transaction delivery status', async () => {
            const updateDeliveryStatusRequest = {
                transaction_id: newlyCreatedTxId,
                is_delivered: 1, // 0 = pending, 1 = delivered
                status: 1, //0 = Pending, 1 = On Delivery, 2 = Delivered, 3 = Rejected
            }

            const { body } = await supertest(app.server)
                .post('/api/v1/admin/transaction/update-delivery-status')
                .set('Authorization', superAdminJwt)
                .set('user-agent', "Test")
                .send(updateDeliveryStatusRequest)
                .expect(200)

            expect(body.message).toEqual(true)
        });

        it('Should reject a transaction', async () => {
            const { body } = await supertest(app.server)
                .post('/api/v1/admin/user/transaction/reject')
                .set('Authorization', superAdminJwt)
                .set('user-agent', "Test")
                .send({ transaction_id: newlyCreatedTxId })
                .expect(200)

            expect(body.message).toEqual(true)
        });

        it('Should delete a transaction', async () => {
            const { body } = await supertest(app.server)
                .post('/api/v1/admin/transaction/delete')
                .set('Authorization', superAdminJwt)
                .set('user-agent', "Test")
                .send({ transaction_id: newlyCreatedTxId })
                .expect(200)

            expect(body.message).toEqual(true)
        });
    })
})