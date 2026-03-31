import { GetOrder } from "./GetOrder";
import { makeOrder } from "../../domain/entities/Order.fixtures";

const fakeOrder = makeOrder();

const mockOrderRepository = {
    save: jest.fn(),
    findById: jest.fn().mockResolvedValue(fakeOrder),
    findAll: jest.fn(),
    update: jest.fn(),
};

describe("GetOrder", () => {
    it("should return an order by id", async () => {
        const useCase = new GetOrder(mockOrderRepository);
        const order = await useCase.execute("123");
        expect(order).toEqual(fakeOrder);
        expect(mockOrderRepository.findById).toHaveBeenCalledWith("123");
    });

    it("should throw if order not found", async () => {
        mockOrderRepository.findById.mockResolvedValueOnce(null);
        const useCase = new GetOrder(mockOrderRepository);
        await expect(useCase.execute("999")).rejects.toThrow("Order not found");
    });
});