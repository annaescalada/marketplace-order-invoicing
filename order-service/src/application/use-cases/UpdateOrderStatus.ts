import { z } from "zod";
import { randomUUID } from "crypto";
import { OrderStatus } from "../../domain/entities/Order";
import { OrderRepository } from "../ports/OrderRepository";
import { OutboxRepository } from "../ports/OutboxRepository";
import { OrderEventType } from "../../domain/entities/OutboxEvent";

export const UpdateOrderStatusSchema = z.object({
    orderId: z.string(),
    status: z.enum(OrderStatus),
});

export type UpdateOrderStatusDto = z.infer<typeof UpdateOrderStatusSchema>;

export class UpdateOrderStatus {
    constructor(
        private readonly orderRepository: OrderRepository,
        private readonly outboxRepository: OutboxRepository
    ) { }

    async execute(input: UpdateOrderStatusDto) {
        const { orderId, status: newStatus } = input;
        const order = await this.orderRepository.findById(orderId);
        if (!order) throw new Error("Order not found");

        order.transitionTo(newStatus);

        if (order.status === OrderStatus.Shipped) {
            await this.orderRepository.update(order);
            await this.outboxRepository.save({
                id: randomUUID(),
                aggregateId: orderId,
                type: OrderEventType.OrderShipped,
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