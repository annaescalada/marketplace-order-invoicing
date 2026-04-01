const amqp = require("amqplib");

const QUEUES = {
    ORDER_SHIPPED: "order.shipped",
} as const;

export class RabbitMQPublisher {
    private connection: any = null;
    private channel: any = null;

    async connect(url: string): Promise<void> {
        this.connection = await amqp.connect(url);
        this.connection.on("error", (err: Error) => console.error("RabbitMQ connection error", err));
        this.channel = await this.connection.createChannel();
        this.channel.on("error", (err: Error) => console.error("RabbitMQ channel error", err));
    }

    async publish(queue: string, payload: object): Promise<void> {
        if (!this.channel) throw new Error("RabbitMQ channel not initialized");
        if (!Object.values(QUEUES).includes(queue as any)) {
            throw new Error(`Unknown queue: ${queue}`);
        }
        await this.channel.assertQueue(queue, { durable: true });
        this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)));
    }

    async close(): Promise<void> {
        await this.channel?.close();
        await this.connection?.close();
    }
}