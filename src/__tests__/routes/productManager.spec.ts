import buildServer from "../../index"

import { expect, beforeAll, afterAll, describe, it, } from 'vitest'
import supertest from "supertest"
import path from "path"
import { DeleteImage } from "../../helpers/utils/image/imageHelper"
import { Product } from "../../domain/model/BaseClass/Product"
import ProductAppService from "../../application/service/Product"

describe('Lists of routes accessible to product manager', () => {
    let app;
    let superAdminJwt: string;
    let newImageFilepath: string;
    let updateImageFilepath: string;
    let bigImageFilepath: string;
    let newProductRequestData: Record<string, string | number>;
    let newlyCreatedProduct: Product;
    let newlyCreatedProductId: number;
    let updateProductRequest

    beforeAll(async () => {
        app = await buildServer()
        await app.ready();
        superAdminJwt = process.env.SUPER_ADMIN_JWT as string;
        newImageFilepath = path.resolve(__dirname, '../__mocks__/tokopaedi.jpg');
        updateImageFilepath = path.resolve(__dirname, '../__mocks__/lupabapak.jpg');
        bigImageFilepath = path.resolve(__dirname, '../__mocks__/big-image.jpg');
        newProductRequestData = {
            name: "Black T-Shirt",
            description: "A plain black t-shirt",
            price: 1000,
            stock: 100,
        };
    })

    afterAll(async () => {
        await app.close()
    })

    const productColumnName = ['id', 'name', 'description', 'price', 'stock', 'public_id', 'img_src']
    const paginationResponseBodyProperty = ['data', 'column', 'lastId', 'hasNext', 'currentPageDataCount']

    it('Should create a product', async function () {

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
            .attach('image', newImageFilepath, { contentType: 'image/jpeg' })

        expect(body.message).toEqual(true)
        expect(statusCode).toBe(200)
    })

    it('Should return list of products in ascending sort.', async () => {

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

        const productData = {
            id: 1,
            name: "iPhone 9",
            description: "An apple mobile which is nothing like apple",
            price: 549,
            stock: 100,
            img_src: "https://res.cloudinary.com/dizgcsbsq/image/upload/v1704712309/tokopaedi/products/iphone-9.jpg",
            public_id: "tokopaedi/products/iphone-9.jpg"
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
        updateProductRequest = {
            id: newlyCreatedProductId,
            name: "Product is just updated",
            stock: 50,
            description: "Product just updated",
            price: 10000
        }

        const { body, statusCode } = await supertest(app.server)
            .post('/api/v1/admin/product/update')
            .set('Authorization', superAdminJwt)
            .set('user-agent', "Test")
            .set('Authorization', superAdminJwt)
            .field('id', updateProductRequest.id)
            .field('name', updateProductRequest.name)
            .field('description', updateProductRequest.description)
            .field('price', updateProductRequest.price)
            .field('stock', updateProductRequest.stock)
            .attach('image', updateImageFilepath, { contentType: 'image/jpeg' })

        expect(statusCode).toBe(200)
        expect(body.message).toEqual(true)
    });

    it('Should check low stock products', async () => {
        const response = await ProductAppService.CheckLowStockProduct()
        expect(response).toEqual(true)
    });

    describe('Fail scenario test', () => {

        describe('Create product', () => {
            it('Should fail to create a product with prohibited name', async () => {

                /**
                 * Test create product api
                 * .set is to set header to the request.
                 * .attach is to attach a file, used to file upload into request.files
                 */
                const { body, statusCode } = await supertest(app.server)
                    .post('/api/v1/admin/product/create')
                    .set('Authorization', superAdminJwt)
                    .set('user-agent', "Test")
                    .field('name', "bajingan")
                    .field('description', newProductRequestData.description)
                    .field('price', newProductRequestData.price)
                    .field('stock', newProductRequestData.stock)
                    .attach('image', newImageFilepath, { contentType: 'image/jpeg' })

                expect(statusCode).toEqual(500)
                expect(body.message).toEqual("You can't use this name!")
            })

            it('Should fail to create a product with wrong image mimetype', async () => {

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
                    .attach('image', newImageFilepath, { contentType: 'text/csv' })

                expect(statusCode).toEqual(500)
                expect(body.message).toEqual("Only .jpg and .png format allowed!")
            })

            it('Should fail to create a product with too big image size', async () => {

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
                    .attach('image', bigImageFilepath, { contentType: 'image/jpeg' })

                expect(statusCode).toEqual(500)
                expect(body.message).toEqual("File too large")
            })
        })

        describe('Update product', () => {
            it('Should fail to update a product with prohibited name', async () => {
                const { body, statusCode } = await supertest(app.server)
                    .post('/api/v1/admin/product/update')
                    .set('Authorization', superAdminJwt)
                    .set('user-agent', "Test")
                    .set('Authorization', superAdminJwt)
                    .field('id', updateProductRequest.id)
                    .field('name', "bajingan")
                    .field('description', updateProductRequest.description)
                    .field('price', updateProductRequest.price)
                    .field('stock', updateProductRequest.stock)
                    .attach('image', updateImageFilepath, { contentType: 'image/jpeg' })

                expect(statusCode).toBe(500)
                expect(body.message).toEqual("You can't use this name!")
            });

            it('Should fail to update a product with wrong image mimetype', async () => {
                const { body, statusCode } = await supertest(app.server)
                    .post('/api/v1/admin/product/update')
                    .set('Authorization', superAdminJwt)
                    .set('user-agent', "Test")
                    .set('Authorization', superAdminJwt)
                    .field('id', updateProductRequest.id)
                    .field('name', updateProductRequest.name)
                    .field('description', updateProductRequest.description)
                    .field('price', updateProductRequest.price)
                    .field('stock', updateProductRequest.stock)
                    .attach('image', updateImageFilepath, { contentType: 'text/csv' })

                expect(statusCode).toEqual(500)
                expect(body.message).toEqual("Only .jpg and .png format allowed!")
            });

            it('Should fail to update a product with wrong image mimetype', async () => {
                const { body, statusCode } = await supertest(app.server)
                    .post('/api/v1/admin/product/update')
                    .set('Authorization', superAdminJwt)
                    .set('user-agent', "Test")
                    .set('Authorization', superAdminJwt)
                    .field('id', updateProductRequest.id)
                    .field('name', updateProductRequest.name)
                    .field('description', updateProductRequest.description)
                    .field('price', updateProductRequest.price)
                    .field('stock', updateProductRequest.stock)
                    .attach('image', bigImageFilepath, { contentType: 'image/jpeg' })

                expect(statusCode).toEqual(500)
                expect(body.message).toEqual("File too large")
            });
        })
    })

    describe('Final step to delete product', () => {
        let public_id: string;

        it('Should return a detail of newly updated product', async () => {
            const { body } = await supertest(app.server)
                .post('/api/v1/product/detail')
                .send({ id: newlyCreatedProductId })
                .expect(200)

            public_id = body.message.public_id

            productColumnName.forEach(element => expect(body.message).toHaveProperty(element))
        });

        it('Should delete a single product', async () => {

            const { body, statusCode } = await supertest(app.server)
                .post('/api/v1/admin/product/delete')
                .set('Authorization', superAdminJwt)
                .set('user-agent', "Test")
                .send({ id: newlyCreatedProductId })

            expect(statusCode).toBe(200)
            expect(body.message).toEqual(true)

            //always delete image on cloudinary after successful test.
            //fifth index is the public_id of the image that we use to delete the image on cloudinary.
            await DeleteImage(public_id)
        });
    })
}) 