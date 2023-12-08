import AdminRepository from "@adapters/outbound/repository/AdminRepository"

export default class AdminDomainService {
    static async GetAdminDataDomain(id: number){
        const result = await AdminRepository.DBGetAdminData(id)
        if (result.length < 1) {
            throw new Error("User not found")
        }
        return result[0]
    }

    static async DeleteUserDomain(email: string){
        const result = await AdminRepository.DBDeleteUser(email)
        if (result.affectedRows < 1){
            throw new Error ("Failed delete data")
        }
        return true
    }

    static async GetUserListDomain(){
        const result = await AdminRepository.DBGetUserList()
        if (result.length < 1){
            throw new Error ("Empty User")
        }
        return result
    }

    static async GetUserDetailProfileDomain(email: string){
        const result = await AdminRepository.DBGetUserDetailProfile(email)
        return result[0]
    }
}
