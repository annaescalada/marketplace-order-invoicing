import { randomUUID } from "crypto";
import { Order, OrderStatus } from "../../domain/entities/Order";
import { OrderRepository } from "../ports/OrderRepository";

interface CreateOrderDto {
  price: number;
  quantity: number;
  productId: string;
  customerId: string;
  sellerId: string;
}

export class CreateOrder {
  constructor(private readonly orderRepository: OrderRepository) {}

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