import { Invoice, InvoiceProps } from "./Invoice";

export const makeInvoice = (overrides: Partial<InvoiceProps> = {}): Invoice =>
  new Invoice({
    invoiceId: "inv-123",
    orderId: "order-123",
    sellerId: "seller-123",
    pdfPath: "/uploads/invoice.pdf",
    sentAt: null,
    createdAt: new Date(),
    ...overrides,
  });