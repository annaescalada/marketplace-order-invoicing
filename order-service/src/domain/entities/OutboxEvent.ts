
export enum OrderEventType {
  OrderShipped = "order.shipped",
}

export interface OutboxEvent {
  id: string;
  aggregateId: string;
  type: OrderEventType;
  payload?: object;
  createdAt: Date;
  publishedAt: Date | null;
  failedAt: Date | null;
  retries: number;
}