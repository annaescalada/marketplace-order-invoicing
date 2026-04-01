export interface InvoiceProps {
  invoiceId: string;
  orderId: string;
  sellerId: string;
  pdfPath: string;
  sentAt: Date | null;
  createdAt: Date;
}

export class Invoice {
  constructor(public readonly props: InvoiceProps) {}

  get sentAt() { return this.props.sentAt; }

  markAsSent(): Invoice {
    return new Invoice({
      ...this.props,
      sentAt: new Date(),
    });
  }

  isSent(): boolean {
    return this.props.sentAt !== null;
  }

  toObject(): InvoiceProps {
    return { ...this.props };
  }
}