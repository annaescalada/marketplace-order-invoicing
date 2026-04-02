import { AppError } from "../../domain/errors";
import { Invoice } from "../../domain/entities/Invoice";
import { InvoiceRepository } from "../ports/InvoiceRepository";

export class GetInvoice {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  async execute(orderId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findByOrderId(orderId);
    if (!invoice) throw new AppError("Invoice not found", 404);
    return invoice;
  }
}