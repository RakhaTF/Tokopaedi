import { AppDataSource } from "@infrastructure/mysql/connection";
import * as UserDto from "@domain/model/User"
import { User } from "@domain/entity/User";

const dataSource = AppDataSource;
const UserDB = dataSource.getRepository(User)

export default class UserRepository {
    static async DBCreateUser(user: UserDto.CreateUserParams): Promise<User> {
        return await UserDB.save(user)
    }

    static async DBGetOneUser({ email, id }: { email?: string, id?: number }): Promise<User> {
        return await UserDB.findOne({ where: [{ email }, { id }] })
    }

    static async DBCheckUserExists(email: string) {
        return await UserDB.manager.query<User[]>(`
            SELECT 
            u.id, u.username, u.email, u.password, u.address, u.role, u.createdAt
            FROM user u
            WHERE u.email = ?`, [email]
        )
    }
}