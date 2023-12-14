export type CreateShippingAddressRequest = {
    address: string;
    city: string;
    province: string;
    postal_code: string;
    country: string;
}

export type UpdateShippingAddressRequest = {
    id: number
    address?: string;
    city?: string;
    province?: string;
    postal_code?: string;
    country?: string;
}

export type GetUserShippingAddressByIdRequest = {
    user_id: number;
}