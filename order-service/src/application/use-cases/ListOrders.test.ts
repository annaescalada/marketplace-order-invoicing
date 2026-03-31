import { ListOrders } from "./ListOrders";
import { makeOrder } from "../../domain/entities/Order.fixtures";

const fakeOrder = makeOrder();

const mockOrderRepository = {
    save: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn().mockResolvedValue([fakeOrder]),
    update: jest.fn(),
};

describe("ListOrders", () => {
    it("should return all orders", async () => {
        const useCase = new ListOrders(mockOrderRepository);
        const orders = await useCase.execute({});
        expect(orders).toEqual([fakeOrder]);
        expect(mockOrderRepository.findAll).toHaveBeenCalledWith({});
    });

    it("should filter by sellerId", async () => {
        const useCase = new ListOrders(mockOrderRepository);
        await useCase.execute({ sellerId: "s1" });
        expect(mockOrderRepository.findAll).toHaveBeenCalledWith({ sellerId: "s1" });
    });
});