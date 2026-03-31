import { OrderStatus } from "../../domain/entities/Order";
import { OrderRepository } from "../ports/OrderRepository";

export class UpdateOrderStatus {
    constructor(private readonly orderRepository: OrderRepository) { }

    async execute(orderId: string, newStatus: OrderStatus) {
        const order = await this.orderRepository.findById(orderId);
        if (!order) {
            throw new Error("Order not found");
        }
        order.transitionTo(newStatus);
        await this.orderRepository.update(order);
        return order;
    }
}