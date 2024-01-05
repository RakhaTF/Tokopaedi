import UserDomainService from "@domain/service/UserDomainService"
import { UserClaimsResponse } from "../response/UserResponse"

export class User {
    id: number
    name: string
    email: string
    level: number
    authority: number[]

    constructor(id=0, name='', email='', level=0, authority=[]) {
        this.id = id
        this.name = name
        this.email = email
        this.level = level
        this.authority = authority
    }

    set(params: UserClaimsResponse): this {
        ({ id: this.id, level: this.level, authority: this.authority } = params)
        return this
    }

    get() {
        return {
            id: this.id,
            level: this.level,
            authority: this.authority,
        }
    }

    static async getUserData(id: number) {
        return UserDomainService.GetUserDataByIdDomain(id)
    }
}