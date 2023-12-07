import { ShippingAddress } from "@domain/model/BaseClass/ShippingAddress";
import { ShippingAddressParamsDto } from "@domain/model/params";
import ShippingAddressDomainService from "@domain/service/ShippingAddressDomainService";
import * as ShippingAddressSchema from "helpers/JoiSchema/ShippingAddress"

export default class ShippingAddressAppService {
    static async CreateShippingAddress(params: ShippingAddressParamsDto.CreateShippingAddressParams) {
        await ShippingAddressSchema.CreateShippingAddress.validateAsync(params)
        await ShippingAddressDomainService.CreateShippingAddressDomain(params)
        return true;
    }

    static async GetShippingAddressDetail(id: number) {
        await ShippingAddressSchema.ShippingAddressId.validateAsync(id)
        return await ShippingAddressDomainService.GetShippingAddressDetailDomain(id)
    }

    static async GetShippingAddressList(user_id: number) {
        await ShippingAddressSchema.ShippingAddressId.validateAsync(user_id)
        return await ShippingAddressDomainService.GetShippingAddressListDomain(user_id)
    }

    static async DeleteShippingAddress(id: number) {
        await ShippingAddressSchema.ShippingAddressId.validateAsync(id)
        await ShippingAddressDomainService.DeleteShippingAddressDomain(id)
        return true;
    }

    static async UpdateShippingAddress(params: ShippingAddressParamsDto.UpdateShippingAddressParams) {
        await ShippingAddressSchema.UpdateShippingAddress.validateAsync(params)
        const { id, address, city, country, postal_code, province, user_id } = params
        
        const existingAddress = await ShippingAddressDomainService.GetShippingAddressDetailDomain(id)

        const updateAddressData: Partial<ShippingAddress> = existingAddress
        
        if (address || postal_code || city || country || province) {
            if (address) updateAddressData.address = address;
            if (postal_code) updateAddressData.postal_code = postal_code;
            if (city) updateAddressData.city = city;
            if (country) updateAddressData.country = country;
            if (province) updateAddressData.province = province;
        }

        await ShippingAddressDomainService.UpdateShippingAddressDomain({...updateAddressData, id, user_id})
        return true;
    }
}