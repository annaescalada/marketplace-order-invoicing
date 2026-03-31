import { OrderRepository } from "../ports/OrderRepository";

export class ListOrders {
    constructor(private readonly orderRepository: OrderRepository) { }

    async execute(filters: { sellerId?: string; customerId?: string }) {
        return await this.orderRepository.findAll(filters);
    }
}