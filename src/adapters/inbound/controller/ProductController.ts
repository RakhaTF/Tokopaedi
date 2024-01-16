import ProductAppService from "@application/service/Product"
import { CommonRequestDto, ProductRequestDto } from "@domain/model/request"
import { FastifyRequest } from "fastify"
import fs from "fs"
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
        const user = request.user
        const deleteProduct = await ProductAppService.SoftDeleteProduct(id, {
            user_id: user.id,
            action: `Delete Product #${id}`,
            ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
            browser: request.headers["user-agent"],
            time: moment().unix(),
        })
        return { message: deleteProduct }
    }

    static async CreateProduct(request: FastifyRequest) {
        const files = request.files
        const newProduct = request.body as ProductRequestDto.CreateProductRequest
        try {
            const jwt = request.user
            const createProduct = await ProductAppService.CreateProduct(newProduct, files, {
                user_id: jwt.id,
                action: "Create Product",
                ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
                browser: request.headers["user-agent"],
                time: moment().unix(),
            })
            return { message: createProduct }

        } catch (error) {
            // Delete tmp files when error occured
            for (const file in files) {
                const imagePath = files[file][0].path
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath)
                }
            }
            throw error
        }
    }

    static async UpdateProduct(request: FastifyRequest) {
        const jwt = request.user
        const files = request.files
        const productUpdate = request.body as ProductRequestDto.UpdateProductRequest
        const updateProduct = await ProductAppService.UpdateProduct(productUpdate, files, {
            user_id: jwt.id,
            action: `Update Product`,
            ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
            browser: request.headers["user-agent"],
            time: moment().unix(),
        })
        return { message: updateProduct }
    }
}
