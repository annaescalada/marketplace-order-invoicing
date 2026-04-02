import mongoose, { Schema, Document } from "mongoose";
import { InvoiceProps } from "../../domain/entities/Invoice";

type InvoiceDocument = InvoiceProps & Document;

const InvoiceSchema = new Schema<InvoiceDocument>(
  {
    invoiceId: { type: String, required: true, unique: true },
    orderId: { type: String, required: true, unique: true },
    sellerId: { type: String, required: true },
    pdfPath: { type: String, required: true },
    sentAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const InvoiceModel = mongoose.model<InvoiceDocument>("Invoice", InvoiceSchema);