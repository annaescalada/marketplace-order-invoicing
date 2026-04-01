import { GetInvoice } from "./GetInvoice";
import { makeInvoice } from "../../domain/entities/Invoice.fixtures";

const fakeInvoice = makeInvoice();

const mockInvoiceRepository = {
  save: jest.fn(),
  findByOrderId: jest.fn().mockResolvedValue(fakeInvoice),
  update: jest.fn(),
};

describe("GetInvoice", () => {
  beforeEach(() => jest.clearAllMocks());

  it("should return invoice by orderId", async () => {
    const useCase = new GetInvoice(mockInvoiceRepository);
    const invoice = await useCase.execute("order-123");
    expect(invoice).toEqual(fakeInvoice);
    expect(mockInvoiceRepository.findByOrderId).toHaveBeenCalledWith("order-123");
  });

  it("should throw if invoice not found", async () => {
    mockInvoiceRepository.findByOrderId.mockResolvedValueOnce(null);
    const useCase = new GetInvoice(mockInvoiceRepository);
    await expect(useCase.execute("order-999")).rejects.toThrow("Invoice not found");
  });
});