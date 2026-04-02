import { OrderEventType } from "../../domain/entities/OutboxEvent";

const amqp = require("amqplib");

const QUEUE_NAME = "order.events";

export class RabbitMQOrderPublisher {
    private connection: any = null;
    private channel: any = null;

    async connect(url: string): Promise<void> {
        this.connection = await amqp.connect(url, {
            clientProperties: {
                connection_name: "order-service",
            }
        });
        this.connection.on("error", (err: Error) => console.error("RabbitMQ connection error", err));
        this.channel = await this.connection.createChannel();
        this.channel.on("error", (err: Error) => console.error("RabbitMQ channel error", err));
        await this.channel.assertQueue(QUEUE_NAME, { durable: true });

    }

    publish(payload: {
        type: OrderEventType;
        orderId: string;
        payload?: object;
    }): void {
        if (!this.channel) throw new Error("RabbitMQ channel not initialized");
        this.channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(payload)));
    }

    async close(): Promise<void> {
        await this.channel?.close();
        await this.connection?.close();
    }
}