type Product = {
    id: number
    name: string
    description: string
    price: number
    stock: number
    public_id: string
    img_src: string
}

export type ProductDetailResponse = Product
export type ProductListResponse = Product[]
