import { Invoice } from "./Invoice";

const makeInvoice = (overrides = {}) => new Invoice({
  invoiceId: "inv-123",
  orderId: "order-123",
  sellerId: "seller-123",
  pdfPath: "/uploads/invoice.pdf",
  sentAt: null,
  createdAt: new Date(),
  ...overrides,
});

describe("Invoice", () => {
  it("should create an invoice with sentAt null", () => {
    const invoice = makeInvoice();
    expect(invoice.props.sentAt).toBeNull();
  });

  it("should mark invoice as sent", () => {
    const invoice = makeInvoice();
    const sent = invoice.markAsSent();
    expect(sent.sentAt).not.toBeNull();
  });

  it("should return false for isSent when sentAt is null", () => {
    const invoice = makeInvoice();
    expect(invoice.isSent()).toBe(false);
  });

  it("should return true for isSent when sentAt is set", () => {
    const invoice = makeInvoice({ sentAt: new Date() });
    expect(invoice.isSent()).toBe(true);
  });
});