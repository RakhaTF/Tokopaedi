import { UserParamsDto } from "@domain/model/params";
import UserDomainService from "@domain/service/UserDomainService";
import * as UserSchema from "helpers/JoiSchema/User";

export default class UserAppService {
    static async GetUserProfileService({id}) {
        await UserSchema.GetUserProfile.validateAsync({id})

        const user = await UserDomainService.GetUserDataByIdDomain(id)

        return user
    }

    static async UpdateUserProfileService(params: UserParamsDto.UpdateUserParams){
        await UserSchema.UpdateUserProfile.validateAsync(params)

        if (params.id < 1){
            throw new Error ("User not found")
        }

        const user = await UserDomainService.GetUserDataByIdDomain(params.id)

        let own = false
        if (user.id == params.id) {
            own = true
        }

        if (user.id < 1){
            throw new Error ("User not found")
        }

        if (user.email != params.email){
            let userEmailExist = await UserDomainService.GetUserEmailExistDomainService(params.email)
            if (userEmailExist.length > 0) {
                throw new Error ("Email is not available")
            }
        }

        if (!own){
            if (user.level == 3){
                throw new Error("You can't change other profile")
            }
        }

        let banned = [
            "SuperAdmin",
            "Product Management Staff",
            "User Management Staff",
            "Shipping and Transaction Management Staff",
            "bangsat",
            "plerrr",
            "kontol",
        ]

        if (banned.includes(params.name)){
            throw new Error("Banned words name")
        }

        let levelAllowed = [1, 2, 5, 3]

        if (user.email != params.email){
            if (!levelAllowed.includes(user.level)){
                throw new Error ("Change email prohibited")
            }
        }

        const obj = {
            id: user.id,
            email: params.email,
            name: params.name
        }

        await UserDomainService.UpdateUserEditProfileDomainService(obj.id, obj.email, obj.name)

        return obj
    }
}