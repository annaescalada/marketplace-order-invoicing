import { Router } from "express";
import multer from "multer";
import { authenticate, authorize } from "../../auth/auth.middleware";
import { InvoiceController } from "./invoice.controller";

const upload = multer({ storage: multer.memoryStorage() });

export function createInvoiceRouter(controller: InvoiceController): Router {
  const router = Router();

  router.post(
    "/",
    authenticate,
    authorize("seller"),
    upload.single("pdf"),
    (req, res) => controller.upload(req, res)
  );

  router.get(
    "/:orderId",
    authenticate,
    authorize("seller"),
    (req, res) => controller.get(req, res)
  );

  return router;
}