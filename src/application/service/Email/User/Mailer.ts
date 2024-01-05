import * as fs from "fs"
import path from "path"
import * as Handlebars from "handlebars"
import { MailOptions } from "nodemailer/lib/json-transport"
import { EmailParamsDto } from "@domain/model/params"

const templatePath = path.join(__dirname, "../../../../helpers/Email/template/")
const partialsDir = path.join(__dirname, "../../../../helpers/Email/template/partials/")

// Register partials
fs.readdirSync(partialsDir).forEach((file) => {
    const source = fs.readFileSync(path.join(partialsDir, file)).toString()
    const partialName = path.basename(file, ".handlebars")
    Handlebars.registerPartial(partialName, source)
})

export const newUserEmailTemplate = async (email: string, username: string, token: string) => {
    const template = fs.readFileSync(templatePath + "User/" + "register.handlebars", "utf8")
    const compiledTemplate = Handlebars.compile(template)
    const html = compiledTemplate({ username, email, link: `${process.env.host}/auth/verify-email/${token}` })

    return {
        from: process.env.GMAIL_SUPER_ADMIN,
        to: email,
        subject: `${username}, Welcome to the Tokopaedi`,
        text: "Welcome to the Tokopaedi",
        html,
    } as MailOptions
}

export const payTransactionEmailTemplate = async (params: EmailParamsDto.PayTransactionEmailParams) => {
    const { email, products, total, username } = params
    const template = fs.readFileSync(templatePath + "User/" + "payTransaction.handlebars", "utf8")
    const compiledTemplate = Handlebars.compile(template)
    const html = compiledTemplate({ username, products, totalPrice: total, email })

    return {
        from: process.env.GMAIL_SUPER_ADMIN,
        to: email,
        subject: `${username}, Thank you for your purchase!`,
        text: "Please proceed to pay your transaction!",
        html,
    } as MailOptions
}

export const successfulTransactionEmailTemplate = (params: EmailParamsDto.successfulTransactionEmailParams) => {
    const { address, email, items, name, orderId, paidTime, paymentMethod, totalAmount, city, country, postalCode, province } = params
    const template = fs.readFileSync(templatePath + "User/" + "successfulPurchase.handlebars", "utf8")
    const compiledTemplate = Handlebars.compile(template)
    const html = compiledTemplate({ address, items, name, orderId, paidTime, paymentMethod, totalAmount, city, country, postalCode, province })

    return {
        from: process.env.GMAIL_SUPER_ADMIN,
        to: email,
        subject: `${name}, Thank you for your purchase!`,
        text: "Thank you for your purchase!",
        html,
    } as MailOptions
}
