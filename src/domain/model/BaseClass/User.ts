import UserDomainService from "@domain/service/UserDomainService"
import { UserClaimsResponse } from "../response/UserResponse"

export class User {
    id: number
    name: string
    email: string
    level: number
    authority: number[]

    constructor() {
        this.id = 0
        this.name = ""
        this.email = ""
        this.level = 0
        this.authority = []
    }

    set(params: UserClaimsResponse) {
        this.id = params.id
        this.level = params.level
        this.authority = params.authority
    }

    get() {
        return {
            id: this.id,
            level: this.level,
            authority: this.authority,
        }
    }

    static async getUserData(id: number) {
        return await UserDomainService.GetUserDataByIdDomain(id)
    }
}
