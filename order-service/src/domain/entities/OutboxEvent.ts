export interface OutboxEvent {
  id: string;
  aggregateId: string;
  type: string;
  payload: object;
  createdAt: Date;
  publishedAt: Date | null;
  failedAt: Date | null;
  retries: number;
}