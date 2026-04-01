import { z } from "zod";
import { randomUUID } from "crypto";
import { Order, OrderStatus } from "../../domain/entities/Order";
import { OrderRepository } from "../ports/OrderRepository";

export const CreateOrderSchema = z.object({
  price: z.number(),
  quantity: z.number(),
  productId: z.string(),
  customerId: z.string(),
  sellerId: z.string(),
});

export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;

export class CreateOrder {
  constructor(private readonly orderRepository: OrderRepository) { }

  async execute(input: CreateOrderDto): Promise<Order> {
    const order = new Order({
      orderId: randomUUID(),
      status: OrderStatus.Created,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...input,
    });

    await this.orderRepository.save(order);
    return order;
  }
}