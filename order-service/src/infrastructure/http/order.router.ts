// order.router.ts
import { Router } from "express";
import { OrderController } from "./order.controller";
import { authenticate, authorize } from "../../auth/auth.middleware";

export function createOrderRouter(controller: OrderController): Router {
    const router = Router();

    router.post("/", authenticate, authorize("customer"), (req, res) => controller.create(req, res));
    router.get("/", authenticate, authorize("seller"), (req, res) => controller.list(req, res));
    router.get("/:id", authenticate, authorize("seller", "customer"), (req, res) => controller.get(req, res));
    router.patch("/:id/status", authenticate, authorize("seller"), (req, res) => controller.updateStatus(req, res));

    return router;
}