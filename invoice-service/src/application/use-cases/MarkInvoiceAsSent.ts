import { InvoiceRepository } from "../ports/InvoiceRepository";

export class MarkInvoiceAsSent {
  constructor(private readonly invoiceRepository: InvoiceRepository) {}

  async execute(orderId: string): Promise<void> {
    const invoice = await this.invoiceRepository.findByOrderId(orderId);
    if (!invoice) return;
    if (invoice.isSent()) return;
    const sent = invoice.markAsSent();
    await this.invoiceRepository.update(sent);
  }
}