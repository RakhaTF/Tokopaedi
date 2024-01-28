import ProductRepository from "@adapters/outbound/repository/ProductRepository"
import { Product } from "@domain/model/BaseClass/Product"
import { ProductParamsDto } from "@domain/model/params"
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
        return await ProductRepository.DBGetProductDetail(id, query_runner)
    }

    static async SoftDeleteProductDomain(id: number, query_runner?: QueryRunner) {
        const deleteProduct = await ProductRepository.DBSoftDeleteProduct(id, query_runner)
        if (deleteProduct.affected < 1) {
            throw new Error("Delete Failed")
        }
    }

    static async CreateProductDomain(product: ProductParamsDto.CreateProductParams, query_runner?: QueryRunner) {
        const newProduct = await ProductRepository.DBCreateProduct(product, query_runner)
        if (newProduct.raw < 1) {
            throw new Error("Create Product Failed!")
        }
    }

    static async UpdateProductDomain(product: ProductParamsDto.UpdateProductParams, query_runner?: QueryRunner) {
        const newProduct = await ProductRepository.DBUpdateProduct(product, query_runner)
        if (newProduct.affected < 1) {
            throw new Error("Update Product Failed!")
        }
        return newProduct
    }

    static async GetProductsPricesAndStockDomain(ids: number[]) {
        const products: Product[] = []
        for (const id of ids) {
            const product = await ProductRepository.DBGetProductDetail(id)
            if (product) {
                products.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    stock: product.stock,
                    description: product.description,
                    img_src: product.img_src,
                    public_id: product.public_id,
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

    static async CheckLowStockProductDomain() {
        return await ProductRepository.DBGetLowStockProduct()
    }
}
