import { Order, OrderProps, OrderStatus } from "./Order";

export const makeOrder = (overrides: Partial<OrderProps> = {}): Order =>
  new Order({
    orderId: "123",
    price: 100,
    quantity: 2,
    productId: "p1",
    customerId: "c1",
    sellerId: "s1",
    status: OrderStatus.Created,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });