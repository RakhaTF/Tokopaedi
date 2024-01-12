import buildServer from "../../index"

import { expect, beforeAll, afterAll, describe, it, } from 'vitest'
import supertest from "supertest"
import path from "path"
import { DeleteImage } from "../../helpers/utils/image/imageHelper"
import { Product } from "../../domain/model/BaseClass/Product"

let app

beforeAll(async () => {
    app = await buildServer()
})

afterAll(async () => {
    await app.close()
})

const superAdminJwt = process.env.SUPER_ADMIN_JWT as string

describe('Product Routes', () => {
    const productColumnName = ['id', 'name', 'description', 'price', 'stock', 'public_id', 'img_src']
    const paginationResponseBodyProperty = ['data', 'column', 'lastId', 'hasNext', 'currentPageDataCount']

    //dummy new productData
    const newProductRequestData = {
        name: "Black T- Shirt",
        description: "A plain black t - shirt",
        price: 1000,
        stock: 100,
    }

    let newlyCreatedProduct: Product;

    let newlyCreatedProductId: number;


    it('Should create a product', async function () {
        await app.ready()
        const filepath = path.resolve(__dirname, '../__mocks__/tokopaedi.jpg')

        /**
         * Test create product api
         * .set is to set header to the request.
         * .attach is to attach a file, used to file upload into request.files
         */
        const { body, statusCode } = await supertest(app.server)
            .post('/api/v1/admin/product/create')
            .set('Authorization', superAdminJwt)
            .set('user-agent', "Test")
            .field('name', newProductRequestData.name)
            .field('description', newProductRequestData.description)
            .field('price', newProductRequestData.price)
            .field('stock', newProductRequestData.stock)
            .attach('image', filepath, { contentType: 'image/jpeg' })

        expect(body.message).toEqual(true)
        expect(statusCode).toBe(200)
    })

    it('Should return list of products in ascending sort.', async () => {
        await app.ready()

        //sample of requestBody.
        const reqBody = {
            limit: 5,
            lastId: 3,
            sort: "ASC"
        }
        //extract the response body.
        const { body } = await supertest(app.server)
            .post('/api/v1/product/list')
            .send(reqBody)
            .expect(200)


        //extract the data
        const data = body.message.data

        const dataLength = data.length

        //extract the last element.
        const lastElement = data[dataLength - 1]
        const firstElement = data[0]

        expect(data).toHaveLength(5)
        expect(body.message.column).toHaveLength(7)
        productColumnName.forEach(element => expect(body.message.column).toContain(element))
        paginationResponseBodyProperty.forEach(element => expect(body.message).toHaveProperty(element))
        expect(body.message).toHaveProperty("hasNext", true)

        //because sort is ASC, we need to test that the sort is working.
        //Product index 0 is the id.
        expect(firstElement[0]).toEqual(reqBody.lastId + 1)
        expect(lastElement[0]).toBeGreaterThan(firstElement[0])
    })

    it('Should return list of products in descending sort.', async () => {
        await app.ready()

        //sample of requestBody.
        const reqBody = {
            limit: 5,
            lastId: 3,
            sort: "ASC"
        }
        //extract the response body.
        const { body } = await supertest(app.server)
            .post('/api/v1/product/list')
            .send(reqBody)
            .expect(200)


        //extract the data
        const data = body.message.data

        const dataLength = data.length

        //extract the last element.
        const lastElement = data[dataLength - 1]
        const firstElement = data[0]

        expect(data).toHaveLength(5)
        expect(body.message.column).toHaveLength(7)
        productColumnName.forEach(element => expect(body.message.column).toContain(element))
        paginationResponseBodyProperty.forEach(element => expect(body.message).toHaveProperty(element))
        expect(body.message).toHaveProperty("hasNext", true)

        //because sort is ASC, we need to test that the sort is working.
        //Product index 0 is the id.
        expect(firstElement[0]).toEqual(reqBody.lastId + 1)
        expect(lastElement[0]).toBeGreaterThan(firstElement[0])
    })

    it('Should return a single/list of products with search filter', async () => {
        await app.ready()

        const reqBody = {
            limit: 5,
            lastId: 3,
            sort: "ASC",
            search: `({name} = '${newProductRequestData.name}')`
        }

        const { body } = await supertest(app.server)
            .post('/api/v1/product/list')
            .send(reqBody)
            .expect(200)

        //assign the response to the newlyCreatedProduct to use later on.
        newlyCreatedProduct = body.message.data[0]
        newlyCreatedProductId = newlyCreatedProduct[0]

        //extract the data
        const productName = body.message.data[0][1]
        const productDescrtiption = body.message.data[0][2]
        const productPrice = body.message.data[0][3]
        const productStock = body.message.data[0][4]

        expect(productName).toEqual(newProductRequestData.name)
        expect(productDescrtiption).toEqual(newProductRequestData.description)
        expect(productPrice).toEqual(parseFloat(newProductRequestData.price.toString()).toFixed(2));
        expect(productStock).toEqual(newProductRequestData.stock)
    });

    it('Should return details of a product', async () => {
        await app.ready()

        const productData = {
            id: 1,
            name: 'iPhone 9',
            description: 'An apple mobile which is nothing like apple',
            price: 549,
            stock: 84,
            public_id: 'tokopaedi/products/iphone-9.jpg',
            img_src: 'https://res.cloudinary.com/dizgcsbsq/image/upload/v1704712309/tokopaedi/products/iphone-9.jpg'
        }

        const { body } = await supertest(app.server)
            .post('/api/v1/product/detail')
            .send({ id: 1 })
            .expect(200)

        expect(body.message).toEqual(productData)
        expect(body.message.id).toEqual(1)
        productColumnName.forEach(element => expect(body.message).toHaveProperty(element))
    })

    it('Should update a single product', async () => {
        await app.ready()

        const { body, statusCode } = await supertest(app.server)
            .post('/api/v1/admin/product/update')
            .set('Authorization', superAdminJwt)
            .set('user-agent', "Test")
            .send({ id: newlyCreatedProductId, stock: 50 })

        expect(statusCode).toBe(200)
        expect(body.message).toEqual(true)
    });

    it('Should delete a single product', async () => {
        await app.ready()

        const { body, statusCode } = await supertest(app.server)
            .post('/api/v1/admin/product/delete')
            .set('Authorization', superAdminJwt)
            .set('user-agent', "Test")
            .send({ id: newlyCreatedProductId })

        expect(statusCode).toBe(200)
        expect(body.message).toEqual(true)

        //always delete image on cloudinary after successful test.
        await DeleteImage(newlyCreatedProduct[5])
    });

}) 