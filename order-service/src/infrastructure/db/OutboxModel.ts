import mongoose, { Schema, Document } from "mongoose";
import { OutboxEvent } from "../../domain/entities/OutboxEvent";

type OutboxDocument = OutboxEvent & Document;

const OutboxSchema = new Schema<OutboxDocument>(
  {
    id: { type: String, required: true, unique: true },
    aggregateId: { type: String, required: true },
    type: { type: String, required: true },
    payload: { type: Schema.Types.Mixed, required: true },
    publishedAt: { type: Date, default: null },
    failedAt: { type: Date, default: null },
    retries: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const OutboxModel = mongoose.model<OutboxDocument>("Outbox", OutboxSchema);