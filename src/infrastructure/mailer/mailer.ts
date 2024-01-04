
import { newUserEmailTemplate, notifyAdminLowStockProductEmailTemplate, notifyAdminNewUserEmailTemplate } from "@application/service/Mailer";
import * as nodemailer from "nodemailer";
import { MailOptions } from "nodemailer/lib/json-transport";

export class Emailer {
    private readonly transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: "smtp-relay.brevo.com",
            port: 587,
            secure: false, // `true` for port 465, `false` for all other ports
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASS,
            },
        });

        this.transporter.verify((err) => {
            if (err) {
                console.log(err)
            } else {
                console.log("Mailer is ready")
            }
        })
    }

    public sendEmail(mailOptions: MailOptions) {
        return this.transporter.sendMail(mailOptions);
    }

    public async notifyAdminForNewUser(email: string, username: string) {
        this.sendEmail(notifyAdminNewUserEmailTemplate(email, username));
    }

    public async notifyUserForSignup(email: string, username: string, token: string) {
        this.sendEmail(await newUserEmailTemplate(email, username, token));
    }

    public async notifyAdminForLowStockProduct(product: { name: string, stock: number }[]){
        this.sendEmail(notifyAdminLowStockProductEmailTemplate(product))
    }
}

export const emailer = new Emailer();