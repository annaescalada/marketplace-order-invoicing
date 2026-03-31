import { UpdateOrderStatus } from "./UpdateOrderStatus";
import { OrderStatus } from "../../domain/entities/Order";
import { makeOrder } from "../../domain/entities/Order.fixtures";

const mockOrderRepository = {
  save: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
};

const mockOutboxRepository = {
  save: jest.fn(),
  findPending: jest.fn(),
  markAsPublished: jest.fn(),
  markAsFailed: jest.fn(),
  incrementRetries: jest.fn(),
};

describe("UpdateOrderStatus", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should transition order to new status", async () => {
    const order = makeOrder();
    mockOrderRepository.findById.mockResolvedValue(order);
    const useCase = new UpdateOrderStatus(mockOrderRepository, mockOutboxRepository);
    const result = await useCase.execute("123", OrderStatus.Accepted);
    expect(result.status).toBe(OrderStatus.Accepted);
    expect(mockOrderRepository.update).toHaveBeenCalledWith(order);
    expect(mockOutboxRepository.save).not.toHaveBeenCalled();
  });

  it("should save outbox event when order is shipped", async () => {
    const order = makeOrder({ status: OrderStatus.Processing });
    mockOrderRepository.findById.mockResolvedValue(order);
    const useCase = new UpdateOrderStatus(mockOrderRepository, mockOutboxRepository);
    await useCase.execute("123", OrderStatus.Shipped);
    expect(mockOutboxRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ type: "order.shipped", aggregateId: "123" })
    );
  });

  it("should throw if order not found", async () => {
    mockOrderRepository.findById.mockResolvedValue(null);
    const useCase = new UpdateOrderStatus(mockOrderRepository, mockOutboxRepository);
    await expect(useCase.execute("999", OrderStatus.Accepted)).rejects.toThrow("Order not found");
  });

  it("should throw on invalid transition", async () => {
    const order = makeOrder();
    mockOrderRepository.findById.mockResolvedValue(order);
    const useCase = new UpdateOrderStatus(mockOrderRepository, mockOutboxRepository);
    await expect(useCase.execute("123", OrderStatus.Shipped)).rejects.toThrow();
  });
});