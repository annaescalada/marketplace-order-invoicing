import { OutboxEvent } from "../../domain/entities/OutboxEvent";
import { OutboxRepository } from "../../application/ports/OutboxRepository";
import { OutboxModel } from "./OutboxModel";
import { ClientSession } from "mongoose";

export class MongoOutboxRepository implements OutboxRepository {
  async save(event: OutboxEvent, session?: ClientSession): Promise<void> {
    await OutboxModel.create([event], { session });
  }

  async findPending(): Promise<OutboxEvent[]> {
    return OutboxModel.find({ publishedAt: null, failedAt: null });
  }

  async markAsPublished(id: string): Promise<void> {
    await OutboxModel.updateOne({ id }, { publishedAt: new Date() });
  }

  async markAsFailed(id: string): Promise<void> {
    await OutboxModel.updateOne({ id }, { failedAt: new Date() });
  }

  async incrementRetries(id: string): Promise<void> {
    await OutboxModel.updateOne({ id }, { $inc: { retries: 1 } });
  }
}