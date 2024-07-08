import { MessageAMQPJSON } from "@infrastructure/amqp/amqp.dto";
import { ConsumeMessage } from "amqplib";
import * as OngkirController from "./controller/ongkir"

export default async function SubscriberMessageHandler(msg: ConsumeMessage | null) {
    if (msg ?? msg.content) {
        const data = <MessageAMQPJSON<any>>JSON.parse(msg.content.toString());

        // cmd harus bernama sesuai dengan fungsi yang ada di OngkirController
        if (data.cmd in OngkirController) {
            const cmd = data.cmd as keyof typeof OngkirController;
            if (typeof OngkirController[cmd] !== 'function') {
                throw new Error("UNKNOWN_COMMAND_ERROR");
            }
            OngkirController[cmd](data);
        }
    }
}