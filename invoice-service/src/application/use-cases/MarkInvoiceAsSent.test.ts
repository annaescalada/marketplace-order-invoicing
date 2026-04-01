import { MarkInvoiceAsSent } from "./MarkInvoiceAsSent";
import { makeInvoice } from "../../domain/entities/Invoice.fixtures";

const mockInvoiceRepository = {
  save: jest.fn(),
  findByOrderId: jest.fn(),
  update: jest.fn(),
};

describe("MarkInvoiceAsSent", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should mark invoice as sent", async () => {
    mockInvoiceRepository.findByOrderId.mockResolvedValue(makeInvoice());
    const useCase = new MarkInvoiceAsSent(mockInvoiceRepository);
    await useCase.execute("order-123");
    expect(mockInvoiceRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({ props: expect.objectContaining({ sentAt: expect.any(Date) }) })
    );
  });

  it("should do nothing if invoice not found", async () => {
    mockInvoiceRepository.findByOrderId.mockResolvedValue(null);
    const useCase = new MarkInvoiceAsSent(mockInvoiceRepository);
    await useCase.execute("order-123");
    expect(mockInvoiceRepository.update).not.toHaveBeenCalled();
  });

  it("should do nothing if invoice already sent", async () => {
    mockInvoiceRepository.findByOrderId.mockResolvedValue(makeInvoice({ sentAt: new Date() }));
    const useCase = new MarkInvoiceAsSent(mockInvoiceRepository);
    await useCase.execute("order-123");
    expect(mockInvoiceRepository.update).not.toHaveBeenCalled();
  });
});