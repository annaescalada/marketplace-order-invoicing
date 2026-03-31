import { randomUUID } from "crypto";
import { OrderStatus } from "../../domain/entities/Order";
import { OrderRepository } from "../ports/OrderRepository";
import { OutboxRepository } from "../ports/OutboxRepository";

export class UpdateOrderStatus {
    constructor(
        private readonly orderRepository: OrderRepository,
        private readonly outboxRepository: OutboxRepository
    ) { }

    async execute(orderId: string, newStatus: OrderStatus) {
        const order = await this.orderRepository.findById(orderId);
        if (!order) throw new Error("Order not found");

        order.transitionTo(newStatus);

        if (order.status === OrderStatus.Shipped) {
            // TODO: atomic session
            await this.orderRepository.update(order);
            await this.outboxRepository.save({
                id: randomUUID(),
                aggregateId: orderId,
                type: "order.shipped",
                payload: { orderId },
                createdAt: new Date(),
                publishedAt: null,
                failedAt: null,
                retries: 0,
            });
        } else {
            await this.orderRepository.update(order);
        }

        return order;
    }
}