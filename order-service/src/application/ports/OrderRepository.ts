import { ClientSession } from "mongoose";
import { Order } from "../../domain/entities/Order";

export interface OrderRepository {
  save(order: Order, session?: ClientSession): Promise<void>;
  findById(orderId: string): Promise<Order | null>;
  findAll(filters: { sellerId?: string; customerId?: string }): Promise<Order[]>;
  update(order: Order, session?: ClientSession): Promise<void>;
}