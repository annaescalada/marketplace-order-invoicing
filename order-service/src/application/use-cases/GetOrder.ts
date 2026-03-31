import { OrderRepository } from "../ports/OrderRepository";

export class GetOrder {
    constructor(private readonly orderRepository: OrderRepository) { }

    async execute(orderId: string) {
        const order = await this.orderRepository.findById(orderId);
        if (!order) {
            throw new Error("Order not found");
        }
        return order;
    }
}
