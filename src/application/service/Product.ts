import { Product } from "@domain/model/BaseClass/Product";
import { CommonRequestDto, ProductRequestDto } from "@domain/model/request";
import ProductDomainService from "@domain/service/ProductDomainService";
import * as ProductSchema from "helpers/JoiSchema/Product";
import * as CommonSchema from "helpers/JoiSchema/Common";
import unicorn from "format-unicorn/safe";
import { GenerateWhereClause, Paginate } from "helpers/pagination/pagination";
import { LogParamsDto } from "@domain/model/params";
import { AppDataSource } from "@infrastructure/mysql/connection"
import LogDomainService from "@domain/service/LogDomainService"

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
            price: "p.price"
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

    static async DeleteProduct(id: number, logData: LogParamsDto.CreateLogParams) {
        await ProductSchema.ProductId.validateAsync(id)

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            await ProductDomainService.DeleteProductDomain(id, query_runner)

            //Insert into log, to track user action.
            await LogDomainService.CreateLogDomain(logData, query_runner)

            await query_runner.commitTransaction()
            await query_runner.release()
            return true;
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }
    
    static async CreateProduct(product: ProductRequestDto.CreateProductRequest, logData: LogParamsDto.CreateLogParams) {
        await ProductSchema.CreateProduct.validateAsync(product)

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()
            await ProductDomainService.CreateProductDomain(product, query_runner)

            //Insert into log, to track user action.
            await LogDomainService.CreateLogDomain(logData, query_runner)

            await query_runner.commitTransaction()
            await query_runner.release()
        
            return true;
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }

    static async UpdateProduct(product: ProductRequestDto.UpdateProductRequest, logData: LogParamsDto.CreateLogParams) {
        await ProductSchema.UpdateProduct.validateAsync(product)
        const { id, description, name, price, stock } = product

        const db = AppDataSource
        const query_runner = db.createQueryRunner()
        await query_runner.connect()

        try {
            await query_runner.startTransaction()

            const existingProduct = await ProductDomainService.GetProductDetailDomain(id, query_runner)

            let updateProductData: Partial<Product> = existingProduct
            if(name || description || price || stock){
                if (name) updateProductData.name = name;
                if (description) updateProductData.description = description;
                if (price) updateProductData.price = price;
                if (stock) updateProductData.stock = stock;
            }

            await ProductDomainService.UpdateProductDomain({...updateProductData, id}, query_runner)
            
            //Insert into log, to track user action.
            await LogDomainService.CreateLogDomain(logData, query_runner)

            await query_runner.commitTransaction()
            await query_runner.release()
            return true;
        } catch (error) {
            await query_runner.rollbackTransaction()
            await query_runner.release()
            throw error
        }
    }
}