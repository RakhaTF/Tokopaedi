import { CreateShippingAddressRequest, UpdateShippingAddressRequest } from "../request/ShippingAddressRequest";

export type CreateShippingAddressParams = CreateShippingAddressRequest & {
    user_id: number
}
export type UpdateShippingAddressParams = UpdateShippingAddressRequest & {
    user_id: number
}