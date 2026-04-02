import { z } from "zod";
const amqp = require("amqplib");

export enum OrderEventType {
    OrderShipped = "order.shipped",
}

const OrderEventSchema = z.object({
    type: z.enum(OrderEventType),
    orderId: z.string(),
});

const QUEUE_NAME = "order.events";

export class RabbitMQOrderConsumer {
    private connection: any = null;
    private channel: any = null;

    async connect(url: string): Promise<void> {
        this.connection = await amqp.connect(url);
        this.connection.on("error", (err: Error) => console.error("RabbitMQ connection error", err));
        this.channel = await this.connection.createChannel();
        this.channel.on("error", (err: Error) => console.error("RabbitMQ channel error", err));
        await this.channel.assertQueue(QUEUE_NAME, { durable: true });

    }

    async consume(handlers: Record<OrderEventType, (orderId: string) => Promise<void>>): Promise<void> {
        if (!this.channel) throw new Error("RabbitMQ channel not initialized");
        this.channel.consume(QUEUE_NAME, async (msg: any) => {
            if (!msg) return;
            try {
                const { type, orderId } = OrderEventSchema.parse(
                    JSON.parse(msg.content.toString())
                );
                const handler = handlers[type];
                if (!handler) {
                    console.warn(`No handler found for event type: ${type}`);
                    this.channel.ack(msg);
                    return;
                }
                await handler(orderId);
                this.channel.ack(msg);
            } catch (err) {
                console.error("Failed to process message", err);
                this.channel.nack(msg, false, false);
            }
        });
    }

    async close(): Promise<void> {
        await this.channel?.close();
        await this.connection?.close();
    }
}