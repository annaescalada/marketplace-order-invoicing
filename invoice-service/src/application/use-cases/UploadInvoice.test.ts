import { UploadInvoice } from "./UploadInvoice";

const mockInvoiceRepository = {
  save: jest.fn(),
  findByOrderId: jest.fn(),
  update: jest.fn(),
};

const mockFileStorage = {
  save: jest.fn().mockResolvedValue("/uploads/invoice.pdf"),
};

describe("UploadInvoice", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should upload invoice and save to repository", async () => {
    const useCase = new UploadInvoice(mockInvoiceRepository, mockFileStorage);
    const invoice = await useCase.execute({
      orderId: "order-123",
      sellerId: "seller-123",
      file: Buffer.from("pdf content"),
      filename: "invoice.pdf",
    });

    expect(mockFileStorage.save).toHaveBeenCalledWith(
      Buffer.from("pdf content"),
      "invoice.pdf"
    );
    expect(mockInvoiceRepository.save).toHaveBeenCalledWith(invoice);
    expect(invoice.props.pdfPath).toBe("/uploads/invoice.pdf");
    expect(invoice.props.sentAt).toBeNull();
  });
});