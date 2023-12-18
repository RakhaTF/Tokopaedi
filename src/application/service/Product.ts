import { Product } from "@domain/model/BaseClass/Product";
import { CommonRequestDto, ProductRequestDto } from "@domain/model/request";
import ProductDomainService from "@domain/service/ProductDomainService";
import * as ProductSchema from "helpers/JoiSchema/Product";
import * as CommonSchema from "helpers/JoiSchema/Common";
import unicorn from "format-unicorn/safe";
import { GenerateWhereClause, Paginate } from "helpers/pagination/pagination";

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

    static async DeleteProduct(id: number) {
        await ProductSchema.ProductId.validateAsync(id)
        await ProductDomainService.DeleteProductDomain(id)
        return true;
    }
    
    static async CreateProduct(product: ProductRequestDto.CreateProductRequest) {
        await ProductSchema.CreateProduct.validateAsync(product)
        await ProductDomainService.CreateProductDomain(product)
        return true;
    }

    static async UpdateProduct(product: ProductRequestDto.UpdateProductRequest) {
        await ProductSchema.UpdateProduct.validateAsync(product)
        const { id, description, name, price, stock } = product

        const existingProduct = await ProductDomainService.GetProductDetailDomain(id)

        let updateProductData: Partial<Product> = existingProduct
        if(name || description || price || stock){
            if (name) updateProductData.name = name;
            if (description) updateProductData.description = description;
            if (price) updateProductData.price = price;
            if (stock) updateProductData.stock = stock;
        }

        await ProductDomainService.UpdateProductDomain({...updateProductData, id})
        return true;
    }
}