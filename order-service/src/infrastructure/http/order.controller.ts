import { z } from "zod";
import { Request, Response } from "express";
import { CreateOrder, CreateOrderSchema } from "../../application/use-cases/CreateOrder";
import { GetOrder } from "../../application/use-cases/GetOrder";
import { ListOrders, ListOrdersSchema } from "../../application/use-cases/ListOrders";
import { UpdateOrderStatus, UpdateOrderStatusSchema } from "../../application/use-cases/UpdateOrderStatus";

export class OrderController {
    constructor(
        private readonly createOrder: CreateOrder,
        private readonly getOrder: GetOrder,
        private readonly listOrders: ListOrders,
        private readonly updateOrderStatus: UpdateOrderStatus,
    ) { }

    async create(req: Request, res: Response): Promise<void> {
        const input = CreateOrderSchema.parse({
            price: req.body.price,
            quantity: req.body.quantity,
            productId: req.body.productId,
            customerId: req.user?.sub,
            sellerId: req.body.sellerId,
        });
        const order = await this.createOrder.execute(input);
        res.status(201).json(order.toObject());
    }

    async get(req: Request, res: Response): Promise<void> {
        const id = z.string().parse(req.params.id);
        const order = await this.getOrder.execute(id);
        res.json(order.toObject());
    }

    async list(req: Request, res: Response): Promise<void> {
        const roleFilters: Record<string, object> = {
            seller: { sellerId: req.user!.sub },
            customer: { customerId: req.user!.sub },
            admin: {}, // Admin can see all orders
        };
        
        const filters = roleFilters[req.user!.role];
        const orders = await this.listOrders.execute(filters);
        res.json(orders.map((o) => o.toObject()));
    }

    async updateStatus(req: Request, res: Response): Promise<void> {
        const input = UpdateOrderStatusSchema.parse({
            orderId: req.params.id,
            status: req.body.status,
        });
        const order = await this.updateOrderStatus.execute(input);
        res.json(order.toObject());
    }
}