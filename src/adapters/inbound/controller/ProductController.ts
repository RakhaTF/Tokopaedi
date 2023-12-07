import ProductAppService from "@application/service/Product";
import { ProductRequestDto } from "@domain/model/request";
import { FastifyRequest } from "fastify";

export default class ProductController {
    static async GetProductList() {
        try {
            const product = await ProductAppService.GetProductList()
            return { message: product };
        } catch (error) {
            throw error
        }
    }

    static async GetProductDetail(request: FastifyRequest) {
        try {
            const { id } = request.body as { id: number }
            const productDetail = await ProductAppService.GetProductDetail(id)
            return { message: productDetail };
        } catch (error) {
            throw error
        }
    }

    static async DeleteProduct(request: FastifyRequest) {
        try {
            const { id } = request.body as { id: number }
            const deleteProduct = await ProductAppService.DeleteProduct(id)
            return { message: deleteProduct };
        } catch (error) {
            throw error
        }
    }

    static async CreateProduct(request: FastifyRequest) {
        try {
            const createProduct = await ProductAppService.CreateProduct(request.body as ProductRequestDto.CreateProductRequest)
            return { message: createProduct };
        } catch (error) {
            throw error
        }
    }

    static async UpdateProduct(request: FastifyRequest) {
        try {
            const updateProduct = await ProductAppService.UpdateProduct(request.body as ProductRequestDto.UpdateProductRequest)
            return { message: updateProduct };
        } catch (error) {
            throw error
        }
    }
}