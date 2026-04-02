import { z } from "zod";
import { Request, Response } from "express";
import { UploadInvoice, UploadInvoiceSchema } from "../../application/use-cases/UploadInvoice";
import { GetInvoice } from "../../application/use-cases/GetInvoice";

export class InvoiceController {
  constructor(
    private readonly uploadInvoice: UploadInvoice,
    private readonly getInvoice: GetInvoice,
  ) {}

  async upload(req: Request, res: Response): Promise<void> {
    const input = UploadInvoiceSchema.parse({
      orderId: req.body.orderId,
      sellerId: req.body.sellerId,
      file: req.file?.buffer,
      filename: req.file?.originalname,
    });
    const invoice = await this.uploadInvoice.execute(input);
    res.status(201).json(invoice.toObject());
  }

  async get(req: Request, res: Response): Promise<void> {
    const orderId = z.string().parse(req.params.orderId);
    const invoice = await this.getInvoice.execute(orderId);
    res.json(invoice.toObject());
  }
}