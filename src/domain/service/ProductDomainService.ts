import ProductRepository from "@adapters/outbound/repository/ProductRepository"
import { Product } from "@domain/model/BaseClass/Product"
import { ProductRequestDto } from "@domain/model/request"
import { RepoPaginationParams } from "key-pagination-sql"
import { QueryRunner } from "typeorm"

export default class ProductDomainService {
    static async GetProductListDomain(params: RepoPaginationParams) {
        const productList = await ProductRepository.DBGetProductList(params)
        if (productList.length < 1) {
            throw new Error("Product is empty!")
        }
        return productList
    }

    static async GetProductDetailDomain(id: number, query_runner?: QueryRunner) {
        const productDetail = await ProductRepository.DBGetProductDetail(id, query_runner)
        if (productDetail.length < 1) {
            throw new Error("Product not found!")
        }
        return productDetail[0]
    }

    static async SoftDeleteProductDomain(id: number, query_runner?: QueryRunner) {
        const deleteProduct = await ProductRepository.DBSoftDeleteProduct(id, query_runner)
        if (deleteProduct.affectedRows < 1) {
            throw new Error("Delete Failed")
        }
    }

    static async CreateProductDomain(product: ProductRequestDto.CreateProductRequest, query_runner?: QueryRunner) {
        const newProduct = await ProductRepository.DBCreateProduct(product, query_runner)
        if (newProduct.affectedRows < 1) {
            throw new Error("Create Product Failed!")
        }
    }

    static async UpdateProductDomain(product: ProductRequestDto.UpdateProductRequest, query_runner?: QueryRunner) {
        const newProduct = await ProductRepository.DBUpdateProduct(product, query_runner)
        if (newProduct.affectedRows < 1) {
            throw new Error("Update Product Failed!")
        }
        return newProduct
    }

    static async GetProductsPricesAndStockDomain(ids: number[]) {
        const products: Product[] = []
        for (const id of ids) {
            const product = await ProductRepository.DBGetProductDetail(id)
            if (product.length > 0) {
                products.push({
                    id: product[0].id,
                    name: product[0].name,
                    price: product[0].price,
                    stock: product[0].stock,
                    description: product[0].description,
                })
            }
        }
        if (products.length < 1) {
            throw new Error(`Product not found`)
        }
        return products
    }

    static async CheckIsProductAliveDomain(id: number) {
        const isAlive = await ProductRepository.DBCheckIsProductAlive(id)
        if (isAlive.length < 1) {
            throw new Error("Product is deleted")
        }
        return true
    }
}
