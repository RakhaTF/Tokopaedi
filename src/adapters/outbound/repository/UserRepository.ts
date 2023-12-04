import { AppDataSource } from "@infrastructure/mysql/connection";
import * as UserDto from "@domain/model/User"
import { User } from "@domain/entity/User";

const dataSource = AppDataSource;
const UserRepository = dataSource.getRepository(User)

export async function DBCreateUser(user: UserDto.CreateUserParams): Promise<User> {
    return await UserRepository.save(user)
}   

export const DBGetOneUser = async ({ email, id }: { email?: string, id?: number }): Promise<User> => await UserRepository.findOne({ where: [{ email }, { id }] })

export async function DBCheckUserExists(email: string) {
    return await UserRepository.manager.query<User[]>(`
    SELECT 
    u.id, u.username, u.email, u.password, u.address, u.role, u.createdAt
    FROM user u
    WHERE u.email = ?`, [email])
}