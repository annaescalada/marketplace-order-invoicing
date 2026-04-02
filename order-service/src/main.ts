import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { AppError } from "./domain/errors";
import { MongoOrderRepository } from "./infrastructure/db/MongoOrderRepository";
import { MongoOutboxRepository } from "./infrastructure/db/MongoOutboxRepository";
import { RabbitMQOrderPublisher } from "./infrastructure/messaging/RabbitMQOrderPublisher";
import { OutboxWorker } from "./infrastructure/messaging/OutboxWorker";
import { CreateOrder } from "./application/use-cases/CreateOrder";
import { GetOrder } from "./application/use-cases/GetOrder";
import { ListOrders } from "./application/use-cases/ListOrders";
import { UpdateOrderStatus } from "./application/use-cases/UpdateOrderStatus";
import { createOrderRouter } from "./infrastructure/http/order.router";
import { OrderController } from "./infrastructure/http/order.controller";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/marketplace-orders";
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672";

async function main() {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const orderRepository = new MongoOrderRepository();
    const outboxRepository = new MongoOutboxRepository();

    const publisher = new RabbitMQOrderPublisher();
    await publisher.connect(RABBITMQ_URL);
    console.log("Connected to RabbitMQ");

    const worker = new OutboxWorker(outboxRepository, publisher);
    worker.start();

    const createOrder = new CreateOrder(orderRepository);
    const getOrder = new GetOrder(orderRepository);
    const listOrders = new ListOrders(orderRepository);
    const updateOrderStatus = new UpdateOrderStatus(orderRepository, outboxRepository);

    const controller = new OrderController(createOrder, getOrder, listOrders, updateOrderStatus);
    app.use("/orders", createOrderRouter(controller));

    app.get("/health", (_, res) => res.json({ status: "ok" }));

    app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
        if (err instanceof AppError) {
            res.status(err.statusCode).json({ error: { message: err.message } });
            return;
        }
        if (err instanceof ZodError) {
            res.status(400).json({ error: { message: "Validation error", details: err.issues } });
            return;
        }
        console.error(err);
        res.status(500).json({ error: { message: "Internal server error" } });
    });

    app.listen(PORT, () => console.log(`Order service running on port ${PORT}`));

    process.on("SIGINT", async () => {
        worker.stop();
        await publisher.close();
        await mongoose.disconnect();
        process.exit(0);
    });
}

main().catch(console.error);