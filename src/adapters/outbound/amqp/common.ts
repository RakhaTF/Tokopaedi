import { AMQPHelper } from "@infrastructure/amqp/amqp";

const amqp = new AMQPHelper();

export async function HealthCheck() {
    const producer = await amqp.GetTokoDeliveryProducer()
    await producer.publish({
        cmd: "CheckHealth"
    }, {})
    console.log(`Healthcheck`)
}

export async function GetProvinces() {
    const producer = await amqp.GetTokoDeliveryProducer()
    await producer.publish({
        cmd: "GetProvince",
        message: {
        }
    }, {})
}