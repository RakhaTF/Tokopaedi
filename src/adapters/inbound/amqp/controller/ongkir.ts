import { MessageAMQPJSON } from "@infrastructure/amqp/amqp.dto";

export async function ProvinceList(msg: MessageAMQPJSON<any>) {
    type provinceType = {
        province_id: number;
        province: string;
    }

    const province: provinceType | provinceType[] = msg.message.results
    if (Array.isArray(province)) {
        province.forEach((p) => {
            // Process each province object
            console.log(p.province_id, p.province);
        });
    } else {
        // Process single province object
        console.log(province.province_id, province.province);
    }
}