// order.router.ts
import { Router } from "express";
import { OrderController } from "./order.controller";

export function createOrderRouter(controller: OrderController): Router {
  const router = Router();

  router.post("/", (req, res) => controller.create(req, res));
  router.get("/", (req, res) => controller.list(req, res));
  router.get("/:id", (req, res) => controller.get(req, res));
  router.patch("/:id/status", (req, res) => controller.updateStatus(req, res));

  return router;
}