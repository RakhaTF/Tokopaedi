import ProductAppService from "@application/service/Product"
import { CommonRequestDto, ProductRequestDto } from "@domain/model/request"
import { FastifyRequest } from "fastify"
import moment from "moment"

export default class ProductController {
    static async GetProductList(request: FastifyRequest) {
        const paginationRequest = request.body as CommonRequestDto.PaginationRequest
        const product = await ProductAppService.GetProductList(paginationRequest)
        return { message: product }
    }

    static async GetProductDetail(request: FastifyRequest) {
        const { id } = request.body as { id: number }
        const productDetail = await ProductAppService.GetProductDetail(id)
        return { message: productDetail }
    }

    static async DeleteProduct(request: FastifyRequest) {
        const { id } = request.body as { id: number }
        const deleteProduct = await ProductAppService.SoftDeleteProduct(id, {
            user_id: id,
            action: `Delete Product ${id}`,
            ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
            browser: request.headers["user-agent"],
            time: moment().unix(),
        })
        return { message: deleteProduct }
    }

    static async CreateProduct(request: FastifyRequest) {
        const jwt = request.user
        const createProduct = await ProductAppService.CreateProduct(request.body as ProductRequestDto.CreateProductRequest, {
            user_id: jwt.id,
            action: "Create Product",
            ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
            browser: request.headers["user-agent"],
            time: moment().unix(),
        })
        return { message: createProduct }
    }

    static async UpdateProduct(request: FastifyRequest) {
        const jwt = request.user
        const updateProduct = await ProductAppService.UpdateProduct(request.body as ProductRequestDto.UpdateProductRequest, {
            user_id: jwt.id,
            action: `Update Product ${jwt.id}`,
            ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
            browser: request.headers["user-agent"],
            time: moment().unix(),
        })
        return { message: updateProduct }
    }
}
