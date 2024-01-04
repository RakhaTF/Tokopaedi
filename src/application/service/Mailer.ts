import * as fs from 'fs';
import path from "path";
import * as Handlebars from 'handlebars'
import { MailOptions } from 'nodemailer/lib/json-transport';

const templatePath = path.join(__dirname, '../../helpers/Email/template/');

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

export const notifyAdminNewUserEmailTemplate = (email: string, username: string) => {
    return {
        from: process.env.GMAIL_SUPER_ADMIN,
        to: process.env.GMAIL_USER,
        subject: `New User: ${username} - email: ${email}`,
        text: `New User: ${username} - email: ${email}`,
        html: `
      <h1>New User: ${username}</h1>
      <p>email: ${email}</p>
    `,
    } as MailOptions;
};

export const notifyAdminLowStockProductEmailTemplate = (product: { name: string, stock: number }[]) => {
    const template = fs.readFileSync(templatePath + 'Admin/' + 'lowStockProduct.handlebars', 'utf8');
    const compiledTemplate = Handlebars.compile(template);
    const html = compiledTemplate({ products: product })
    return {
        from: process.env.GMAIL_SUPER_ADMIN,
        to: process.env.GMAIL_USER,
        subject: `Low Stock Product Notification`,
        text: `Low Stock Product Notification`,
        html,
    } as MailOptions;
};