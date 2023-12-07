import { Product } from "@domain/model/BaseClass/Product";
import { ProductRequestDto } from "@domain/model/request";
import ProductDomainService from "@domain/service/ProductDomainService";
import * as ProductSchema from "helpers/JoiSchema/Product";

export default class ProductAppService {
    static async GetProductList() {
        return await ProductDomainService.GetProductListDomain()
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