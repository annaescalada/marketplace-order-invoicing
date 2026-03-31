import { Order, OrderProps } from "../../domain/entities/Order";
import { OrderRepository } from "../../application/ports/OrderRepository";
import { OrderModel } from "./OrderModel";
import { ClientSession } from "mongoose";

export class MongoOrderRepository implements OrderRepository {
  async save(order: Order, session?: ClientSession): Promise<void> {
    await OrderModel.create([order.toObject()], { session });
  }

  async findById(orderId: string): Promise<Order | null> {
    const doc = await OrderModel.findOne({ orderId });
    if (!doc) return null;
    return new Order(doc.toObject() as OrderProps);
  }

  async findAll(filters: { sellerId?: string; customerId?: string }): Promise<Order[]> {
    const docs = await OrderModel.find(filters);
    return docs.map((doc) => new Order(doc.toObject() as OrderProps));
  }

  async update(order: Order, session?: ClientSession): Promise<void> {
    await OrderModel.updateOne({ orderId: order.props.orderId }, order.toObject(), { session });
  }
}