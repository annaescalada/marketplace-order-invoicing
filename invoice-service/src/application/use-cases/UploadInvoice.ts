import { z } from "zod";
import { randomUUID } from "crypto";
import { Invoice } from "../../domain/entities/Invoice";
import { InvoiceRepository } from "../ports/InvoiceRepository";
import { FileStorage } from "../ports/FileStorage";

export const UploadInvoiceSchema = z.object({
    orderId: z.string(),
    sellerId: z.string(),
    file: z.instanceof(Buffer),
    filename: z.string()
});

export type UploadInvoiceInput = z.infer<typeof UploadInvoiceSchema>;

export class UploadInvoice {
    constructor(
        private readonly invoiceRepository: InvoiceRepository,
        private readonly fileStorage: FileStorage,
    ) { }

    async execute(input: UploadInvoiceInput): Promise<Invoice> {
        const pdfPath = await this.fileStorage.save(input.file, input.filename);

        const invoice = new Invoice({
            invoiceId: randomUUID(),
            orderId: input.orderId,
            sellerId: input.sellerId,
            pdfPath: pdfPath,
            sentAt: null,
            createdAt: new Date(),
        });

        await this.invoiceRepository.save(invoice);
        return invoice;
    }
}