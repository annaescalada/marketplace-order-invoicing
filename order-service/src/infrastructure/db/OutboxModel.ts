import mongoose, { Schema, Document } from "mongoose";
import { OrderEventType, OutboxEvent } from "../../domain/entities/OutboxEvent";

type OutboxDocument = OutboxEvent & Document;

const OutboxSchema = new Schema<OutboxDocument>(
  {
    id: { type: String, required: true, unique: true },
    aggregateId: { type: String, required: true },
    type: { type: String, enum: Object.values(OrderEventType), required: true }, publishedAt: { type: Date, default: null },
    payload: { type: Schema.Types.Mixed, default: {} },
    failedAt: { type: Date, default: null },
    retries: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const OutboxModel = mongoose.model<OutboxDocument>("Outbox", OutboxSchema);