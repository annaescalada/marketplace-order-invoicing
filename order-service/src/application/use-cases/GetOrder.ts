import { AppError } from "../../domain/errors";
import { OrderRepository } from "../ports/OrderRepository";

export class GetOrder {
    constructor(private readonly orderRepository: OrderRepository) { }

    async execute(orderId: string) {
        const order = await this.orderRepository.findById(orderId);
        if (!order) {
            throw new AppError("Order not found", 404);
        }
        return order;
    }
}
