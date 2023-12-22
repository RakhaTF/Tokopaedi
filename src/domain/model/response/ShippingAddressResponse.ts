export type ShippingAddressResponse = {
    id: number
    user_id: number
    address: string
    postal_code: string
    city: string
    province: string
    country: string
}

export type GetUserShippingAddressById = {
    id: number
    address: string
    postal_code: string
    city: string
    province: string
    country: string
}
