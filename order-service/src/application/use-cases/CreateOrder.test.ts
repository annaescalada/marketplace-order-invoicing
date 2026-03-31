import { CreateOrder } from "./CreateOrder";
import { OrderStatus } from "../../domain/entities/Order";

const mockOrderRepository = {
  save: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
};

describe("CreateOrder", () => {
  it("should create an order with Created status", async () => {
    const useCase = new CreateOrder(mockOrderRepository);

    const order = await useCase.execute({
      price: 100,
      quantity: 2,
      productId: "p1",
      customerId: "c1",
      sellerId: "s1",
    });

    expect(order.status).toBe(OrderStatus.Created);
    expect(mockOrderRepository.save).toHaveBeenCalledWith(order);
  });
});