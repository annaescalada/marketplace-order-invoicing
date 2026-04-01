import { z } from "zod";
import { OrderRepository } from "../ports/OrderRepository";

export const ListOrdersSchema = z.object({
  sellerId: z.string().optional(),
  customerId: z.string().optional(),
});

export type ListOrdersInput = z.infer<typeof ListOrdersSchema>;

export class ListOrders {
    constructor(private readonly orderRepository: OrderRepository) { }

    async execute(filters: { sellerId?: string; customerId?: string }) {
        return await this.orderRepository.findAll(filters);
    }
}