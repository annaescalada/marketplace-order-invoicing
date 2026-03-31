import { OutboxEvent } from "../../domain/entities/OutboxEvent";

export interface OutboxRepository {
  save(event: OutboxEvent, session?: unknown): Promise<void>;
  findPending(): Promise<OutboxEvent[]>;
  markAsPublished(id: string): Promise<void>;
  incrementRetries(id: string): Promise<void>;
  markAsFailed(id: string): Promise<void>;
}