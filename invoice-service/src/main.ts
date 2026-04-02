import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { AppError } from "./domain/errors";
import { MongoInvoiceRepository } from "./infrastructure/db/MongoInvoiceRepository";
import { DiskFileStorage } from "./infrastructure/storage/DiskFileStorage";
import { OrderEventType, RabbitMQOrderConsumer } from "./infrastructure/messaging/RabbitMQOrderConsumer";
import { UploadInvoice } from "./application/use-cases/UploadInvoice";
import { GetInvoice } from "./application/use-cases/GetInvoice";
import { MarkInvoiceAsSent } from "./application/use-cases/MarkInvoiceAsSent";
import { InvoiceController } from "./infrastructure/http/invoice.controller";
import { createInvoiceRouter } from "./infrastructure/http/invoice.router";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3002;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/marketplace-invoices";
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost:5672";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const invoiceRepository = new MongoInvoiceRepository();
  const fileStorage = new DiskFileStorage();

  const uploadInvoice = new UploadInvoice(invoiceRepository, fileStorage);
  const getInvoice = new GetInvoice(invoiceRepository);
  const markInvoiceAsSent = new MarkInvoiceAsSent(invoiceRepository);

  const consumer = new RabbitMQOrderConsumer();
  await consumer.connect(RABBITMQ_URL);
  const handlers = {
    [OrderEventType.OrderShipped]: async (orderId: string) => {
      await markInvoiceAsSent.execute(orderId);
    },
  };
  await consumer.consume(handlers);
  console.log("Connected to RabbitMQ — listening for order.shipped events");

  const controller = new InvoiceController(uploadInvoice, getInvoice);
  app.use("/invoices", createInvoiceRouter(controller));

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

  app.listen(PORT, () => console.log(`Invoice service running on port ${PORT}`));

  process.on("SIGINT", async () => {
    await consumer.close();
    await mongoose.disconnect();
    process.exit(0);
  });
}

main().catch(console.error);