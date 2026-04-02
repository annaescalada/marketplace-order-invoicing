import { Invoice, InvoiceProps } from "../../domain/entities/Invoice";
import { InvoiceRepository } from "../../application/ports/InvoiceRepository";
import { InvoiceModel } from "./InvoiceModel";

export class MongoInvoiceRepository implements InvoiceRepository {
  async save(invoice: Invoice): Promise<void> {
    await InvoiceModel.create([invoice.toObject()]);
  }

  async findByOrderId(orderId: string): Promise<Invoice | null> {
    const doc = await InvoiceModel.findOne({ orderId });
    if (!doc) return null;
    return new Invoice(doc.toObject() as InvoiceProps);
  }

  async update(invoice: Invoice): Promise<void> {
    await InvoiceModel.updateOne(
      { invoiceId: invoice.props.invoiceId },
      invoice.toObject()
    );
  }
}