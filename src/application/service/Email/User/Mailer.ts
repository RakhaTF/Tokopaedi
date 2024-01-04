import * as fs from 'fs';
import path from "path";
import * as Handlebars from 'handlebars'
import { MailOptions } from 'nodemailer/lib/json-transport';
import { EmailParamsDto } from '@domain/model/params';

const templatePath = path.join(__dirname, '../../../../helpers/Email/template/');

export const newUserEmailTemplate = async (email: string, username: string, token: string) => {
    const template = fs.readFileSync(templatePath + 'User/' + 'register.handlebars', 'utf8');
    const compiledTemplate = Handlebars.compile(template);
    const html = compiledTemplate({ username, email, link: `${process.env.host}/auth/verify-email/${token}` });

    return {
        from: process.env.GMAIL_SUPER_ADMIN,
        to: email,
        subject: `${username}, Welcome to the Tokopaedi`,
        text: "Welcome to the Tokopaedi",
        html
    } as MailOptions;
};

export const payTransactionEmailTemplate = async (params: EmailParamsDto.PayTransactionEmailParams) => {
    const { email, products, total, username } = params
    const template = fs.readFileSync(templatePath + 'User/' + 'payTransaction.handlebars', 'utf8');
    const compiledTemplate = Handlebars.compile(template);
    const html = compiledTemplate({ username, products, totalPrice: total, email })

    return {
        from: process.env.GMAIL_SUPER_ADMIN,
        to: email,
        subject: `${username}, Thank you for your purchase!`,
        text: "Please proceed to pay your transaction!",
        html
    } as MailOptions;
};