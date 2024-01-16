import { Product } from "@domain/model/BaseClass/Product"
import { CommonRequestDto, ProductRequestDto } from "@domain/model/request"
import ProductDomainService from "@domain/service/ProductDomainService"
import * as ProductSchema from "@helpers/JoiSchema/Product"
import * as CommonSchema from "@helpers/JoiSchema/Common"
import unicorn from "format-unicorn/safe"
import { GenerateWhereClause, Paginate } from "key-pagination-sql"
import { LogParamsDto } from "@domain/model/params"
import { AppDataSource } from "@infrastructure/mysql/connection"
import LogDomainService from "@domain/service/LogDomainService"
import { Profanity } from "indonesian-profanity"
import { emailer } from "@infrastructure/mailer/mailer"
import { DeleteImage, UploadImage } from "@helpers/utils/image/imageHelper"
import { File, FilesObject } from "fastify-multer/lib/interfaces"
export default class ProductAppService {
    static async GetProductList(params: CommonRequestDto.PaginationRequest) {
        await CommonSchema.Pagination.validateAsync(params)
        const { lastId = 0, limit = 100, search, sort = "ASC" } = params

        /*
        search filter, to convert filter field into sql string
        e.g: ({name} = "iPhone" AND {price} > 1000) will turn into ((p.name = "iPhone" AND p.price > 1000))
        every field name need to be inside {}
        */
        let searchFilter = search || ""
        searchFilter = unicorn(searchFilter, {
            name: "p.name",
            price: "p.price",
        })

        //Generate whereClause
        const whereClause = GenerateWhereClause({ lastId, searchFilter, sort, tableAlias: "p", tablePK: "id" })

        const product = await ProductDomainService.GetProductListDomain({ limit: Number(limit), whereClause, sort })

        //Generate pagination
        const result = Paginate({ data: product, limit })

        return result
    }

    static async GetProductDetail(id: number) {
        await ProductSchema.ProductId.validateAsync(id)
        return await ProductDomainService.GetProductDetailDomain(id)
    }

    static async SoftDeleteProduct(id: number, logData: LogParamsDto.CreateLogParams) {
        await ProductSchema.ProductId.validateAsync(id)

        //additional checking to prevent mutate deleted data.
        await ProductDomainService.CheckIsProductAliveDomain(id)

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            await ProductDomainService.SoftDeleteProductDomain(id, query_runner)

            //Insert into log, to track user action.
            await LogDomainService.CreateLogDomain(logData, query_runner)

            await query_runner.commitTransaction()
            await query_runner.release()
            return true
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }

    static async CreateProduct(product: ProductRequestDto.CreateProductRequest, files: FilesObject, logData: LogParamsDto.CreateLogParams) {
        await ProductSchema.CreateProduct.validateAsync(product)

        //checking if the product name contains bad word.
        if (Profanity.flag(product.name.toLowerCase())) {
            throw new Error("You can't use this name!")
        }

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()
        try {
            await query_runner.startTransaction()

            const imageObjects: Partial<File[]> = [];

            for (const key in files) {
                if (files && Object.prototype.hasOwnProperty.call(files, key)) {
                    const fileArray = files[key];
                    if (Array.isArray(fileArray) && fileArray.length > 0) {
                        const imageFile = fileArray[0]; // Assuming each key in files is an array and you want the first file
                        const imageFileType = imageFile.mimetype;
                        const imageMimeTypes = ['image/gif', 'image/jpeg', 'image/png'];
                        const imageSize = imageFile.size / 1000; // Size in kilobytes

                        // Validate files mimetype and size
                        if (!imageMimeTypes.includes(imageFileType)) throw new Error("INVALID_FILE_TYPE")
                        if (imageSize > 2048) throw new Error(`${imageFile.fieldname?.toUpperCase()}_FILE_SIZE_TOO_BIG._MAX_2_MB`)

                        imageObjects.push({
                            fieldname: imageFile.fieldname,
                            encoding: imageFile.encoding,
                            mimetype: imageFile.mimetype,
                            originalname: imageFile.originalname,
                            filename: imageFile.filename,
                        });
                    }
                }
            }

            //upload image to cloudinary and extract the url & public_id.
            const { secure_url, public_id } = await UploadImage(imageObjects[0])

            //create the product, insert into database.
            await ProductDomainService.CreateProductDomain({ ...product, img_src: secure_url, public_id }, query_runner)

            //Insert into log, to track user action.
            await LogDomainService.CreateLogDomain({ ...logData, action: `Create Product #${product.name}` }, query_runner)

            await query_runner.commitTransaction()
            await query_runner.release()

            return true
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }

    static async UpdateProduct(product: ProductRequestDto.UpdateProductRequest, files: FilesObject, logData: LogParamsDto.CreateLogParams) {
        await ProductSchema.UpdateProduct.validateAsync(product)
        const { id, description, name, price, stock } = product

        //additional checking to prevent mutate deleted data.
        await ProductDomainService.CheckIsProductAliveDomain(id)

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()
        try {
            await query_runner.startTransaction()

            const existingProduct = await ProductDomainService.GetProductDetailDomain(id, query_runner)

            const updateProductData: Partial<Product> = existingProduct
            if (name || description || price || stock || files) {
                if (name) {
                    //Add name checking, can not use bad words for the product name
                    if (Profanity.flag(product.name.toLowerCase())) {
                        throw new Error("You can't use this name!")
                    }
                    updateProductData.name = name
                }
                if (description) updateProductData.description = description
                if (price) updateProductData.price = price
                if (stock) updateProductData.stock = stock
                //If user 
                if (files) {
                    for (const key in files) {
                        if (files && Object.prototype.hasOwnProperty.call(files, key)) {
                            const fileArray = files[key];
                            if (Array.isArray(fileArray) && fileArray.length > 0) {
                                const imageFile = fileArray[0]; // Assuming each key in files is an array and you want the first file
                                const imageFileType = imageFile.mimetype;
                                const imageMimeTypes = ['image/gif', 'image/jpeg', 'image/png'];
                                const imageSize = imageFile.size / 1000; // Size in kilobytes

                                // Validate files mimetype and size
                                if (!imageMimeTypes.includes(imageFileType)) throw new Error("INVALID_FILE_TYPE")
                                if (imageSize > 2048) throw new Error(`${imageFile.fieldname?.toUpperCase()}_FILE_SIZE_TOO_BIG._MAX_2_MB`)

                                const imageObjects: Partial<File[]> = [];

                                imageObjects.push({
                                    fieldname: imageFile.fieldname,
                                    encoding: imageFile.encoding,
                                    mimetype: imageFile.mimetype,
                                    originalname: imageFile.originalname,
                                    filename: imageFile.filename,
                                });

                                //delete the old image from cloudinary if user passed a new image
                                await DeleteImage(existingProduct.public_id)

                                //upload new image to cloudinary and extract the url & public_id.
                                const { secure_url, public_id } = await UploadImage(imageObjects[0])

                                updateProductData.public_id = public_id
                                updateProductData.img_src = secure_url

                            }
                        }
                    }
                }
            }

            await ProductDomainService.UpdateProductDomain({ ...updateProductData, id }, query_runner)

            //Insert into log, to track user action.
            await LogDomainService.CreateLogDomain({ ...logData, action: `Update Product #${id}` }, query_runner)

            await query_runner.commitTransaction()
            await query_runner.release()
            return true
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }

    static async CheckLowStockProduct() {
        const productList = await ProductDomainService.CheckLowStockProductDomain()
        if (productList.length !== 0) {
            const lowStockProduct = productList.map((prod) => ({
                name: prod.name,
                stock: prod.stock,
            }))
            //send email to admin to notify.
            emailer.notifyAdminForLowStockProduct(lowStockProduct)
            return true
        }
    }
}
