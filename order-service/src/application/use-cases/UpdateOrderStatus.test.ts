import { UpdateOrderStatus } from "./UpdateOrderStatus";
import { OrderStatus } from "../../domain/entities/Order";
import { makeOrder } from "../../domain/entities/Order.fixtures";

const mockOrderRepository = {
  save: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
};

describe("UpdateOrderStatus", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should transition order to new status", async () => {
    const order = makeOrder();
    mockOrderRepository.findById.mockResolvedValue(order);
    const useCase = new UpdateOrderStatus(mockOrderRepository);
    const result = await useCase.execute("123", OrderStatus.Accepted);
    expect(result.status).toBe(OrderStatus.Accepted);
    expect(mockOrderRepository.update).toHaveBeenCalledWith(order);
  });

  it("should throw if order not found", async () => {
    mockOrderRepository.findById.mockResolvedValue(null);
    const useCase = new UpdateOrderStatus(mockOrderRepository);
    await expect(useCase.execute("999", OrderStatus.Accepted)).rejects.toThrow("Order not found");
  });

  it("should throw on invalid transition", async () => {
    const order = makeOrder();
    mockOrderRepository.findById.mockResolvedValue(order);
    const useCase = new UpdateOrderStatus(mockOrderRepository);
    await expect(useCase.execute("123", OrderStatus.Shipped)).rejects.toThrow();
  });
});