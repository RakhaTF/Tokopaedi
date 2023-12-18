import { FastifyRequest } from "fastify";
import AdminAppService from "@application/service/Admin";
import TransactionAppService from "@application/service/Transaction";
import { AdminRequestDto, CommonRequestDto, ShippingAddressRequestDto, TransactionRequestDto } from "@domain/model/request";
import ShippingAddressAppService from "@application/service/ShippingAddress";
import moment from "moment";

export default class AdminController {
    static async GetAdminProfile(request: FastifyRequest){
        try {
            const jwt = request.user
            const getAdminProfile = await AdminAppService.GetAdminProfileService({
                id: jwt.id
            })

            const result = {message: getAdminProfile}

            return result
        } catch (error) {
            throw error
        }
    }

    static async CreateUser(request: FastifyRequest){
        try {
            const jwt = request.user
            const {name, email, password} = request.body as AdminRequestDto.CreateUserRequest
            const createUser = await AdminAppService.CreateUserService({
                id: jwt.id,
                name,
                email,
                password
            })

            const result = {message: createUser}

            return result
        } catch (error) {
            throw error
        }
    }

    static async UpdateProfileUser(request: FastifyRequest){
        try {
            const jwt = request.user
            const {userid, name, email} = request.body as AdminRequestDto.UpdateUserProfileRequest
            const updateUserProfile = await AdminAppService.UpdateProfileUser({
                id: jwt.id,
                userid,
                name,
                email
            })

            const result = {message : updateUserProfile}

            return result
        } catch (error) {
            throw error
        }
    }

    static async UpdateProfile(request: FastifyRequest){
        try {
            const jwt = request.user
            const {name, email} = request.body as AdminRequestDto.UpdateProfileRequest
            const updateProfile = await AdminAppService.UpdateProfileService({
                id: jwt.id,
                name,
                email
            })

            const result = {message : updateProfile}

            return result
        } catch (error) {
            throw error
        }
    }

    static async DeleteUser(request: FastifyRequest){
        try {
            const jwt = request.user
            const {email} = request.body as AdminRequestDto.DeleteUserRequest
            const deleteUser = await AdminAppService.DeleteUserService({
                id: jwt.id,
                email
            })

            const result = {message : deleteUser}

            return result
        } catch (error) {
            throw error
        }
    }

    static async GetUserList(){
        try {
            const getUserList = await AdminAppService.GetUserListService()

            const result = {message : getUserList}

            return result
        } catch (error) {
            throw error
        }
    }

    static async GetUserDetailProfile(request: FastifyRequest){
        try {
            const jwt = request.user
            const {email} = request.body as AdminRequestDto.GetUserDetailProfileRequest
            const getUserDetailProfile = await AdminAppService.GetUserDetailProfileService({id: jwt.id, email})

            const result = {message: getUserDetailProfile}
            return result
        } catch (error) {
            throw error
        }
    }

    static async GetAdminList() {
        try {
            const admin = await AdminAppService.GetAdminListService()
            return { message: admin }
        } catch (error) {
            throw error
        }
    }

    static async GetRulesList() {
        try {
            const rules = await AdminAppService.GetRulesListService()
            return { message: rules }
        } catch (error) {
            throw error
        }
    }

    static async CreateRule(request: FastifyRequest) {
        try {
            const { id } = request.user
            const { rule } = request.body as { rule: string }
            const createRule = await AdminAppService.CreateRules(rule, {
                user_id: id,
                action: `Create Rule ${rule}`,
                ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
                browser: request.headers["user-agent"] as string,
                time: moment().unix(),
            })
            return { message: createRule }
        } catch (error) {
            throw error
        }
    }

    static async UpdateRule(request: FastifyRequest) {
        try {
            const { id } = request.user
            const updateRuleParams = request.body as AdminRequestDto.UpdateRuleRequest
            const updateRule = await AdminAppService.UpdateRule(updateRuleParams, {
                user_id: id,
                action: `Update Rule #${updateRuleParams.rules_id}`,
                ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
                browser: request.headers["user-agent"] as string,
                time: moment().unix(),
            })
            return { message: updateRule }
        } catch (error) {
            throw error
        }
    }

    static async DeleteRule(request: FastifyRequest) {
        try {
            const { id } = request.user
            const { rules_id } = request.body as { rules_id: number }
            const deleteRule = await AdminAppService.DeleteRule(rules_id, {
                user_id: id,
                action: `Delete Rule #${rules_id}`,
                ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
                browser: request.headers["user-agent"] as string,
                time: moment().unix(),
            })
            return { message: deleteRule }
        } catch (error) {
            throw error
        }
    }
    
    static async AssignRule(request: FastifyRequest) {
        try {
            const { id } = request.user
            const assignRuleParams = request.body as AdminRequestDto.AssignRuleRequest
            const assignRule = await AdminAppService.AssignRule(assignRuleParams, {
                user_id: id,
                action: `Assign Rule #${assignRuleParams.rules_id} To User Group #${assignRuleParams.group_id}`,
                ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
                browser: request.headers["user-agent"] as string,
                time: moment().unix(),
            })
            return { message: assignRule }
        } catch (error) {
            throw error
        }
    }

    static async RevokeRule(request: FastifyRequest) {
        try {
            const { id } = request.user
            const revokeRuleParams = request.body as AdminRequestDto.RevokeRuleRequest
            const RevokeRule = await AdminAppService.RevokeRule(revokeRuleParams, {
                user_id: id,
                action: `Revoke Rule #${revokeRuleParams.rules_id} From User Group #${revokeRuleParams.group_id}`,
                ip: (request.headers["x-forwarded-for"] as string) || (request.ip == "::1" ? "127.0.0.1" : request.ip),
                browser: request.headers["user-agent"] as string,
                time: moment().unix(),
            })
            return { message: RevokeRule }
        } catch (error) {
            throw error
        }
    }

    static async ChangeUserPass(request: FastifyRequest){
        try {
            const { userid, password, confirmPassword } = request.body as AdminRequestDto.ChangeUserPassRequest 
            const changeUserPass = await AdminAppService.ChangeUserPass({
                userid,
                password,
                confirmPassword
            })

            const result = {message: changeUserPass}

            return result
        } catch (error) {
            throw error
        }
    }

    static async ChangePass(request: FastifyRequest){
        try {
            const jwt = request.user
            const {oldPassword, newPassword} = request.body as AdminRequestDto.ChangePasswordRequest
            const changePassword = await AdminAppService.ChangePasswordService({
                id: jwt.id,
                oldPassword,
                newPassword
            })

            const result = {message: changePassword}

            return result
        } catch (error) {
            throw error
        }
    }

    static async GetTransactionList(){
        try {
            const getTransactionList = await AdminAppService.TransactionListService()

            const result = {message: getTransactionList}
            return result
        } catch (error) {
            throw error
        }
    }

    static async GetUserTransactionListById(request: FastifyRequest){
        try {
            const { userid } = request.body as TransactionRequestDto.GetUserTransactionListByIdRequest
            const paginationRequest = request.body as CommonRequestDto.PaginationRequest
            const getUserTransactionListById = await TransactionAppService.GetUserTransactionListByIdService({
                userid
            }, paginationRequest)

            const result = {message: getUserTransactionListById}
            return result
        } catch (error) {
            throw error
        }
    }

    static async UpdateDeliveryStatus(request: FastifyRequest) {
        try {
            const { is_delivered, status, transaction_id } = request.body as TransactionRequestDto.UpdateDeliveryStatusRequest
            const updateDeliveryStatus = await TransactionAppService.UpdateDeliveryStatus({ is_delivered, status, transaction_id })     
            return { message: updateDeliveryStatus }
        } catch (error) {
            throw error;
        }
    }

    static async ApproveTransaction(request: FastifyRequest) {
        try {
            const { transaction_id } = request.body as TransactionRequestDto.UpdateTransactionStatusRequest
            const approveTransaction = await TransactionAppService.ApproveTransaction({ transaction_id })     
            return { message: approveTransaction }
        } catch (error) {
            throw error;
        }
    }

    static async RejectTransaction(request: FastifyRequest) {
        try {
            const { transaction_id } = request.body as TransactionRequestDto.UpdateTransactionStatusRequest
            const rejectTransaction = await TransactionAppService.RejectTransaction({ transaction_id })     
            return { message: rejectTransaction }
        } catch (error) {
            throw error;
        }
    }

    static async GetUserShippingAddress(){
        try {
            const getUserShippingAddress = await AdminAppService.GetUserShippingAddressService()
            const result = {message: getUserShippingAddress}

            return result
        } catch (error) {
            throw error
        }
    }

    static async GetUserShippingAddressById(request: FastifyRequest){
        try {
            const {user_id} = request.body as ShippingAddressRequestDto.GetUserShippingAddressByIdRequest
            const getUserShippingAddressById = await ShippingAddressAppService.GetUserShippingAddressByIdService({user_id})

            const result = {message: getUserShippingAddressById}
            return result
        } catch (error) {
            throw error
        }
    }

    static async GetUserTransactionDetail(request: FastifyRequest){
        try {
            const { id } = request.body as { id: number }
            const transactionDetail = await TransactionAppService.GetTransactionDetail(id)
            return { message: transactionDetail }
        } catch (error) {
            throw error
        }
    }

    static async UpdateUserLevel(request: FastifyRequest){
        try {
            const { user_id, level } = request.body as AdminRequestDto.UpdateUserLevelRequest
            const updateUserLevel = await AdminAppService.UpdateUserLevelService({
                user_id,
                level
            })

            const result = {message: updateUserLevel}
            return result
        } catch (error) {
            throw error
        }
    }

    static async DeleteUserTransaction(request: FastifyRequest){
        try {
            const { transaction_id } = request.body as { transaction_id: number }
            const deleteTransaction = await TransactionAppService.DeleteUserTransaction(transaction_id)

            const result = {message: deleteTransaction}
            return result
        } catch (error) {
            throw error
        }
    }
}