import { Order, OrderStatus } from "./Order";

const makeOrder = () => new Order({
  orderId: "123",
  price: 100,
  quantity: 2,
  productId: "p1",
  customerId: "c1",
  sellerId: "s1",
  status: OrderStatus.Created,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe("Order", () => {
  it("should create an order with Created status", () => {
    const order = makeOrder();
    expect(order.status).toBe(OrderStatus.Created);
  });

  it("should transition from Created to Accepted", () => {
    const order = makeOrder();
    order.transitionTo(OrderStatus.Accepted);
    expect(order.status).toBe(OrderStatus.Accepted);
  });

  it("should throw on invalid transition", () => {
    const order = makeOrder();
    expect(() => order.transitionTo(OrderStatus.Shipped)).toThrow();
  });

  it("should update updatedAt on transition", () => {
    const order = makeOrder();
    const before = order.updatedAt;
    order.transitionTo(OrderStatus.Accepted);
    expect(order.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });
});