import ProductRepository from "@adapters/outbound/repository/ProductRepository";
import { ProductRequestDto } from "@domain/model/request";

export default class ProductDomainService {
    static async GetProductListDomain(){
        const productList = await ProductRepository.DBGetProductList()
        if(productList.length < 1){
            throw new Error("Product is empty!")
        }
        return productList
    }
    
    static async GetProductDetailDomain(id: number){
        const productDetail = await ProductRepository.DBGetProductDetail(id)
        if(productDetail.length < 1){
            throw new Error("Product not found!")
        }
        return productDetail[0]
    }

    static async DeleteProductDomain(id: number){
        const deleteProduct = await ProductRepository.DBDeleteProduct(id)
        if(deleteProduct.affectedRows < 1){
            throw new Error("Delete Failed")
        }
    }

    static async CreateProductDomain(product: ProductRequestDto.CreateProductRequest) {
        const newProduct = await ProductRepository.DBCreateProduct(product)
        if(newProduct.affectedRows<1){
            throw new Error("Create Product Failed!")
        }
    }

    static async UpdateProductDomain(product: ProductRequestDto.UpdateProductRequest) {
        const newProduct = await ProductRepository.DBUpdateProduct(product)
        if(newProduct.affectedRows<1){
            throw new Error("Update Product Failed!")
        }
    }

    static async GetProductsPricesDomain(ids: number[]) {
        const products = [];
        for (const id of ids) {
            const product = await ProductRepository.DBGetProductDetail(id);
            if (product.length > 0) {
                products.push({ id: product[0].id, price: product[0].price });
            }
        }
        if(products.length < 1) {
            throw new Error(`Product not found`);
        }
        return products;
    }
}