import { Product } from "@domain/model/BaseClass/Product"
import { CommonRequestDto, ProductRequestDto } from "@domain/model/request"
import ProductDomainService from "@domain/service/ProductDomainService"
import * as ProductSchema from "@helpers/JoiSchema/Product"
import { UserId } from "@helpers/JoiSchema/User"
import * as CommonSchema from "@helpers/JoiSchema/Common"
import unicorn from "format-unicorn/safe"
import { GenerateWhereClause, Paginate } from "key-pagination-sql"
import { LogParamsDto, ProductParamsDto } from "@domain/model/params"
import { AppDataSource } from "@infrastructure/mysql/connection"
import LogDomainService from "@domain/service/LogDomainService"
import { Profanity } from "indonesian-profanity"
import { emailer } from "@infrastructure/mailer/mailer"
import { DeleteImage, UploadImage } from "@helpers/utils/image/imageHelper"
import { File, FilesObject } from "fastify-multer/lib/interfaces"
import { BadInputError } from "@domain/model/Error/Error"
import { redisClient } from "@infrastructure/redis/redis"
import { QueryRunner } from "typeorm"
import { ImageDetail } from "@domain/model/params/HelperParams"

export default class ProductAppService {
    static async GetProductList(params: CommonRequestDto.PaginationRequest, productListParams: ProductParamsDto.GetProductListParams) {
        await CommonSchema.Pagination.validateAsync(params)

        // validating productListParams filter
        await ProductSchema.ProductList.validateAsync(productListParams)

        const { limit = 100, search, sort = "ASC", lastId = 0 } = params
        const { categoriesFilter, ratingSort, sortFilter, priceMax, priceMin, lastPrice, lastRating } = productListParams

        // variable to hold having filter for rating & review_count (aggregated)
        let having = ""

        // additional validation for price filter.
        // price max can not be lower than price min
        if (priceMax < priceMin) {
            throw new BadInputError("MAX_PRICE_SHOULD_BE_GREATER_THAN_MIN_PRICE")
        }

        /*
        search filter, to convert filter field into sql string
        e.g: ({name} = "iPhone" AND {price} > 1000) will turn into ((p.name = "iPhone" AND p.price > 1000))
        every field name need to be inside {}
        */
        let searchFilter = search || ""
        searchFilter = unicorn(searchFilter, {
            name: "p.name",
            single_category: "pc.name",
        })

        //Generate whereClause
        let whereClause = GenerateWhereClause({ lastId, searchFilter, sort, tableAlias: "p", tablePK: "id" })

        let baseSort: string

        // sort filter based on user input.
        switch (sortFilter) {
            // Add mostReviewed product if user want to sort by review count.
            case "mostReviewed":
                baseSort = `ORDER BY review_count DESC, p.id ${sort}`
                break
            // Add ratingSort if user want to sort by lowest/highest rating.
            case "highestRating":
                baseSort = `ORDER BY rating DESC, p.id ${sort}`
                break
            case "lowestRating":
                baseSort = `ORDER BY rating ASC, p.id ${sort}`
                break
            case "lowestPrice":
                baseSort = `ORDER BY price ASC, p.id ${sort}`
                break
            case "highestPrice":
                baseSort = `ORDER BY price DESC, p.id ${sort}`
                break
            default:
                baseSort = `ORDER BY p.id ${sort}`
                break
        }

        // rating filter, for example: > 4 star review.
        switch (ratingSort) {
            case "greaterThanOrEqualFour":
                having = `HAVING rating >= 4`
                break
            case "greaterThanOrEqualThree":
                having = `HAVING rating >= 3`
                break
            case "greaterThanOrEqualTwo":
                having = `HAVING rating >= 2`
                break
        }

        // single price filter
        if (priceMin) {
            whereClause += ` AND p.price >= ${priceMin}`
        }

        // single price filter
        if (priceMax) {
            whereClause += ` AND p.price <= ${priceMax}`
        }

        // price filter, between min and max
        if (priceMin && priceMax) {
            whereClause += ` AND p.price BETWEEN ${priceMin} AND ${priceMax}`
        }

        //  Add category filter, to fetch the categories and it's sub-categories.
        //  for example, if user passes "Electronics", will fetch every product that is under that category.
        // for instance, Smartphones, Laptop, Computers, etc.
        if (categoriesFilter) {
            whereClause += ` AND pc.cat_path LIKE CONCAT((SELECT cat_path FROM product_category WHERE name = '${categoriesFilter}'), "%")`
        }

        // Default id for determining if its the first time hit or not based on lastId.
        const DEFAULT_ID = 1
        /**
         * If user passes sort based on highest/lowest rating/price.
         * we need to modify the whereClause to ensure pagination working properly.
         */
        if (sortFilter && lastId >= DEFAULT_ID) {
            switch (sortFilter) {
                case "highestRating":
                    having = `HAVING rating = ${lastRating} OR rating < ${lastRating}`
                    break
                case "lowestRating":
                    having = `HAVING rating = ${lastRating} OR rating > ${lastRating}`
                    break
                case "lowestPrice":
                    whereClause += ` AND price = ${lastPrice} OR price > ${lastPrice}`
                    break
                case "highestPrice":
                    whereClause += ` AND price = ${lastPrice} OR price < ${lastPrice}`
                    break
                default:
                    break
            }
        }

        // Use caching for product list.
        let products;
        const encodedWhereClause = encodeURIComponent(whereClause)
        const encodedLastId = encodeURIComponent(lastId)
        const encodedLimit = encodeURIComponent(limit)
        const encodedSort = encodeURIComponent(baseSort)
        const encodedHaving = encodeURIComponent(having)
        
        const key = `productList:where=${encodedWhereClause}:lastId=${encodedLastId}:limit=${encodedLimit}:sort=${encodedSort}:having=${encodedHaving}`
        const value = await redisClient.get(key);

        if (value) {
            products = JSON.parse(value);
        } else {
            products = await ProductDomainService.GetProductListDomain({ limit: Number(limit), whereClause, sort: baseSort }, having)
            redisClient.setex(key, 300, JSON.stringify(products));
        }

        //Generate pagination
        return Paginate({ data: products, limit })
    }

    static async GetProductDetail(id: number, user_id?: number) {
        await ProductSchema.ProductId.validateAsync(id)

        // Use caching for product detail.
        let productDetail;
        const key = `productDetail:id=${id}:user=${user_id || 0}`;
        const value = await redisClient.get(key);

        if (value) {
            productDetail = JSON.parse(value);
        } else {
            productDetail = await ProductDomainService.GetProductDetailDomain(id, user_id)
            redisClient.setex(key, 300, JSON.stringify(productDetail));
        }

        return productDetail
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
            throw new Error("YOUR_NAME_CONTAINS_CONTENT_THAT_DOES_NOT_MEET_OUR_COMMUNITY_STANDARDS_PLEASE_REVISE_YOUR_NAME")
        }

        if (!files.thumbnailImage) {
            throw new BadInputError("YOU_NEED_TO_PROVIDE_THUMBNAIL_FOR_THE_PRODUCT")
        }

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()
        try {
            await query_runner.startTransaction()

            // initiate imageObjects variable to hold files of image/images.
            const imageObjects = this.processFiles(files)

            //create the product, insert into database.
            // extract the insertId (newly created product id)
            const { insertId } = await ProductDomainService.CreateProductDomain(product, query_runner)

            await this.uploadImagesToGallery(imageObjects, insertId, query_runner)

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

    static async UpdateProduct(product: ProductRequestDto.UpdateProductRequest, logData: LogParamsDto.CreateLogParams) {
        await ProductSchema.UpdateProduct.validateAsync(product)
        const { id, description, name, price, stock, category } = product

        //additional checking to prevent mutate deleted data.
        await ProductDomainService.CheckIsProductAliveDomain(id)

        const existingProduct = await ProductDomainService.GetProductDetailDomain(id)

        //Can update product partially, not all property is required
        const updateProductData: Partial<Product> = existingProduct

        //Add name checking, can not use bad words for the product name
        if (name && Profanity.flag(product.name.toLowerCase())) {
            throw new Error("YOUR_NAME_CONTAINS_CONTENT_THAT_DOES_NOT_MEET_OUR_COMMUNITY_STANDARDS_PLEASE_REVISE_YOUR_NAME")
        }
        updateProductData.name = name

        if (category) updateProductData.category_id = category

        if (description) updateProductData.description = description
        if (price) updateProductData.price = price
        if (stock) updateProductData.stock = stock

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()
        try {
            await query_runner.startTransaction()

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

    static async GetReviewList(id: number, params: CommonRequestDto.PaginationRequest) {
        await CommonSchema.Pagination.validateAsync(params)
        await ProductSchema.ProductId.validateAsync(id)
        const { lastId = 0, limit = 100, search = "", sort = "ASC" } = params

        //Generate whereClause
        const whereClause = GenerateWhereClause({ lastId, searchFilter: search, sort, tableAlias: "pr", tablePK: "id" })

        const review = await ProductDomainService.GetProductReviewListDomain(id, { limit: Number(limit), whereClause, sort })

        //Generate pagination
        const result = Paginate({ data: review, limit })

        return result
    }

    static async CreateReview(params: ProductParamsDto.CreateProductReviewParams, logData: LogParamsDto.CreateLogParams) {
        await ProductSchema.CreateReview.validateAsync(params)

        const { comment, user_id, product_id } = params

        // Check if the comment contains bad words.
        if (comment && Profanity.flag(comment)) {
            throw new BadInputError("YOUR_REVIEW_CONTAINS_CONTENT_THAT_DOES_NOT_MEET_OUR_COMMUNITY_STANDARDS_PLEASE_REVISE_YOUR_COMMENT")
        }

        // Check if user already reviewed the product, will return error if true.
        await ProductDomainService.CheckExistingReviewDomain(product_id, user_id)

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            await ProductDomainService.CreateProductReviewDomain(params, query_runner)

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

    static async ReviewDetail(id: number) {
        await ProductSchema.ReviewId.validateAsync(id)
        return await ProductDomainService.GetProductReviewDetailDomain(id)
    }

    static async DeleteReview(id: number, user_id: number, level: number, logData: LogParamsDto.CreateLogParams) {
        await ProductSchema.ReviewId.validateAsync(id)

        // Check if the review ownership, does it belong to the user trying to delete it.
        // will throw an error if the review belongs to someone else.
        // level = 3 is a regular user, if admin tryng to delete a review, it doesnt check ownership.
        if (level == 3) {
            await ProductDomainService.CheckReviewOwnershipDomain(id, user_id)
        }
        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            await ProductDomainService.DeleteProductReviewDomain(id, query_runner)

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

    static async CreateProductCategory(params: ProductRequestDto.CreateProductCategoryRequest, logData: LogParamsDto.CreateLogParams) {
        await ProductSchema.CreateCategory.validateAsync(params)

        const { name, parent_id } = params

        // checking if name is containing bad word
        if (Profanity.flag(name.toLowerCase())) {
            throw new BadInputError("YOUR_CATEGORY_NAME_CONTAINS_CONTENT_THAT_DOES_NOT_MEET_OUR_COMMUNITY_STANDARDS_PLEASE_REVISE_YOUR_CATEGORY_NAME")
        }

        // checking if there's already a category with the same name, if it's true, throw an error.
        await ProductDomainService.CheckExistingCategoryDomain(name)

        let cat_path: string

        // if parent_id = null, the cat_path is /0/NEW.id/.
        //  when parent_id = null, the category is the head category / doesn't have parent category.
        // if parent_id != null, category is a sub-category.
        if (parent_id === 0) {
            cat_path = "/0/"
        } else {
            // Getting parent cat_path if parent_id != null
            const parent = await ProductDomainService.GetProductCategoryDetailDomain(parent_id)
            cat_path = parent.cat_path
        }

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()
            await ProductDomainService.CreateProductCategoryDomain({ ...params, cat_path }, query_runner)

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

    static async CategoryList(params: CommonRequestDto.PaginationRequest) {
        await CommonSchema.Pagination.validateAsync(params)

        const { lastId = 0, limit = 100, search = "", sort = "ASC" } = params

        let searchFilter = search || ""
        searchFilter = unicorn(searchFilter, {
            name: "pc.name",
            parent_id: "pc.parent_id",
            sub_category: "pc.cat_path",
        })

        //Generate whereClause
        const whereClause = GenerateWhereClause({ lastId, searchFilter, sort, tableAlias: "pc", tablePK: "id" })

        const category = await ProductDomainService.GetProductCategoryListDomain({ limit: Number(limit), whereClause, sort })

        //Generate pagination
        const result = Paginate({ data: category, limit })

        return result
    }

    static async UpdateProductCategory(params: ProductRequestDto.UpdateProductCategoryRequest, logData: LogParamsDto.CreateLogParams) {
        await ProductSchema.UpdateCategory.validateAsync(params)

        const { id, name, parent_id } = params

        // checking if name is containing bad word
        if (name && Profanity.flag(name.toLowerCase())) {
            throw new BadInputError("YOUR_CATEGORY_NAME_CONTAINS_CONTENT_THAT_DOES_NOT_MEET_OUR_COMMUNITY_STANDARDS_PLEASE_REVISE_YOUR_CATEGORY_NAME")
        }

        // fetching existing category
        const existingCategory = await ProductDomainService.GetProductCategoryDetailDomain(id)

        const updateCategory = existingCategory

        let cat_path = existingCategory.cat_path
        if (name) updateCategory.name = name

        if (parent_id && parent_id != existingCategory.parent_id) {
            updateCategory.parent_id = parent_id

            // if parent_id = 0, the cat_path is /0/NEW.id/.
            //  when parent_id = 0, the category is the head category / doesn't have parent category.
            // if parent_id > 0, category is a sub-category.
            if (parent_id === 0) {
                cat_path = "/0/"
            } else {
                // Getting parent cat_path if parent_id > 0
                const parent = await ProductDomainService.GetProductCategoryDetailDomain(parent_id)
                cat_path = parent.cat_path
            }
        }

        // checking if there's already a category with the same name, if it's true, throw an error.
        await ProductDomainService.CheckExistingCategoryDomain(name)

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()
        try {
            await query_runner.startTransaction()

            await ProductDomainService.UpdateProductCategoryDomain({ ...updateCategory, cat_path }, query_runner)

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

    static async DeleteProductCategory(id: number, logData: LogParamsDto.CreateLogParams) {
        await ProductSchema.CategoryId.validateAsync(id)

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            await ProductDomainService.DeleteProductCategoryDomain(id, query_runner)

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

    static async GetWishlistedProductList(params: CommonRequestDto.PaginationRequest, productListParams: ProductParamsDto.GetProductListParams, user_id: number, collection_id: number) {
        await CommonSchema.Pagination.validateAsync(params)

        await UserId.validateAsync(user_id)

        // validating productListParams filter
        await ProductSchema.ProductList.validateAsync(productListParams)

        const { lastId = 0, limit = 100, search, sort = "ASC" } = params

        const { categoriesFilter, ratingSort, sortFilter } = productListParams

        /*
        search filter, to convert filter field into sql string
        e.g: ({name} = "iPhone" AND {price} > 1000) will turn into ((p.name = "iPhone" AND p.price > 1000))
        every field name need to be inside {}
        */
        let searchFilter = search || ""
        searchFilter = unicorn(searchFilter, {
            name: "p.name",
            price: "p.price",
            single_category: "pc.name",
        })

        //Generate whereClause
        let whereClause = GenerateWhereClause({ lastId, searchFilter, sort, tableAlias: "p", tablePK: "id" })

        let baseSort: string

        // sort filter based on user input.
        switch (sortFilter) {
            // Add mostReviewed product if user want to sort by review count.
            case "mostReviewed":
                baseSort = `ORDER BY review_count DESC`
                break
            // Add ratingSort if user want to sort by lowest/highest rating.
            case "highestRating":
                baseSort = `ORDER BY rating DESC`
                break
            case "lowestRating":
                baseSort = `ORDER BY rating ASC`
                break
            default:
                baseSort = `ORDER BY p.id ${sort}`
                break
        }

        // rating filter, for example: > 4 star review.
        switch (ratingSort) {
            case "greaterThanOrEqualFour":
                whereClause += ` AND rating >= 4`
                break
            case "greaterThanOrEqualThree":
                whereClause += ` AND rating >= 3`
                break
            case "greaterThanOrEqualTwo":
                whereClause += ` AND rating >= 2`
                break
        }

        //  Add category filter, to fetch the categories and it's sub-categories.
        //  for example, if user passes "Electronics", will fetch every product that is under that category.
        // for instance, Smartphones, Laptop, Computers, etc.
        if (categoriesFilter) {
            whereClause += ` AND pc.cat_path LIKE CONCAT((SELECT cat_path FROM product_category WHERE name = '${categoriesFilter}'), "%")`
        }

        // Append the user id to the whereclause because we want to fetch a user wishlist.
        // append the collection id if user want to fetch a specific collection wishlist.
        if (collection_id) {
            whereClause += ` AND wc.id = ${collection_id} AND u.id = ${user_id}`
        } else {
            whereClause += ` AND u.id = ${user_id}`
        }

        const product = await ProductDomainService.GetWishlistedProductListDomain({ limit: Number(limit), whereClause, sort: baseSort })

        //Generate pagination
        const result = Paginate({ data: product, limit })

        return result
    }

    static async GetWishlistCollection(user_id: number) {
        await ProductSchema.WishlistCollection.validateAsync(user_id)
        return await ProductDomainService.GetWishlistCollectionDomain(user_id)
    }

    static async CreateWishlistCollection(name: string, user_id: number) {
        await ProductSchema.CreateCollection.validateAsync({ name, user_id })
        await ProductDomainService.CreateWishlistCollectionDomain(name, user_id)
        return true
    }

    static async UpdateWishlistCollection(name: string, collection_id: number) {
        await ProductSchema.UpdateCollection.validateAsync({ name, collection_id })
        await ProductDomainService.UpdateWishlistCollectionNameDomain(name, collection_id)
        return true
    }

    static async DeleteWishlistCollection(collection_id: number) {
        await ProductSchema.CollectionId.validateAsync(collection_id)
        await ProductDomainService.DeleteWishlistCollectionDomain(collection_id)
        return true
    }

    static async AddProductToWishlist(collection_id: number, product_id: number) {
        await ProductSchema.AddProductToWishlist.validateAsync({ collection_id, product_id })
        await ProductDomainService.AddProductToWishlistDomain(collection_id, product_id)
        return true
    }

    static async RemoveProductFromWishlist(collection_id: number, product_id: number) {
        await ProductSchema.RemoveProductFromWishlist.validateAsync({ collection_id, product_id })
        await ProductDomainService.RemoveProductFromWishlistDomain(collection_id, product_id)
        return true
    }

    static async UpdateImageGallery(params: ProductRequestDto.UpdateProductImageGalleryRequest, files: FilesObject) {
        const { product_id, display_order, thumbnail, id } = params

        const existingImage = await ProductDomainService.FindProductImageDetailDomain(id, product_id)

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()
        try {
            await query_runner.startTransaction()

            // initiate an updateObject to hold all the update arguments.
            const updateObject = this.createUpdateObject(existingImage, display_order, thumbnail)

            // if user want to update image and it is supplied, process the image and update it.
            if (files) {
                const imageObjects = this.processFiles(files)
                await this.updateImagesToGallery(imageObjects, updateObject)
            }

            await ProductDomainService.UpdateImageProductGalleryDomain({ ...updateObject, id }, query_runner)
            await query_runner.commitTransaction()
            await query_runner.release()

            return true
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }

    static async AddImageGallery(params: ProductParamsDto.AddImageGalleryParams, files: FilesObject) {
        const { product_id } = params

        await ProductSchema.ProductId.validateAsync(product_id)

        const imageObjects = this.processFiles(files)

        if (imageObjects.length === 0) {
            throw new BadInputError("PLEASE_PROVIDE_IMAGE")
        }

        await this.uploadImagesToGallery(imageObjects, product_id)

        return true
    }

    static async DeleteImageGallery(params: ProductRequestDto.DeleteImageGalleryRequest) {
        ProductSchema.DeleteImageGallery.validateAsync(params)

        // delete image from cloudinary
        await DeleteImage(params.public_id)

        // delete image data from database
        await ProductDomainService.DeleteImageProductGalleryDomain(params)
        return true
    }

    static async HardDeleteProduct(product_id: number) {
        ProductSchema.ProductId.validateAsync(product_id)

        /**
         * extract the public id of images of a product that we want to delete
         * so that we can delete the image on cloudinary.
         */
        const publicIds = await ProductDomainService.GetProductImagePublicIdDomain(product_id)
        await Promise.all(publicIds.map(async (img) => await DeleteImage(img.public_id)))

        await ProductDomainService.HardDeleteProductDomain(product_id)
        return true
    }

    private static processFiles(files: FilesObject): Partial<File[]> {
        const imageObjects: Partial<File[]> = []

        for (const key in files) {
            if (Object.prototype.hasOwnProperty.call(files, key)) {
                const fileArray = files[key]
                if (Array.isArray(fileArray) && fileArray.length > 0) {
                    for (const imageFile of fileArray) {
                        imageObjects.push({
                            fieldname: imageFile.fieldname,
                            encoding: imageFile.encoding,
                            mimetype: imageFile.mimetype,
                            originalname: imageFile.originalname,
                            filename: imageFile.filename,
                        })
                    }
                }
            }
        }

        return imageObjects
    }

    private static async uploadImagesToGallery(imageObjects: Partial<File[]>, product_id: number, query_runner?: QueryRunner) {
        await Promise.all(
            imageObjects.map(async (image) => {
                const { secure_url, public_id } = await UploadImage(image)
                const thumbnail = image.fieldname === "thumbnailImage" ? 1 : 0
                const display_order = this.getDisplayOrder(image.fieldname) || 1
                await ProductDomainService.AddImageProductGalleryDomain(
                    {
                        img_src: secure_url,
                        public_id,
                        product_id,
                        display_order,
                        thumbnail,
                    },
                    query_runner
                )
            })
        )
    }

    private static createUpdateObject(existingImage: ImageDetail, display_order: number, thumbnail: number) {
        const updateObject: Partial<ImageDetail> = existingImage

        if (display_order && display_order !== existingImage.display_order) {
            updateObject.display_order = display_order
        }

        if (thumbnail && thumbnail !== existingImage.thumbnail) {
            updateObject.thumbnail = thumbnail
        }

        return updateObject
    }

    private static async updateImagesToGallery(imageObjects: Partial<File[]>, updateObject: Partial<ImageDetail>) {
        if (imageObjects.length === 0) {
            throw new BadInputError("PLEASE_PROVIDE_IMAGE")
        }

        await Promise.all(
            imageObjects.map(async (image) => {
                // delete existing image and replace it with new image
                await DeleteImage(updateObject.public_id)

                //upload image to cloudinary and extract the url & public_id.
                const { secure_url, public_id } = await UploadImage(image)

                updateObject.img_src = secure_url
                updateObject.public_id = public_id
            })
        )
    }

    private static getDisplayOrder(fieldname: string): number | undefined {
        const displayOrderMap = {
            thumbnailImage: 1,
            secondImage: 2,
            thirdImage: 3,
            fourthImage: 4,
            fifthImage: 5,
        }
        return displayOrderMap[fieldname]
    }
}
