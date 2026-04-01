import { Invoice } from "../../domain/entities/Invoice";

export interface InvoiceRepository {
  save(invoice: Invoice): Promise<void>;
  findByOrderId(orderId: string): Promise<Invoice | null>;
  update(invoice: Invoice): Promise<void>;
}