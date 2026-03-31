import mongoose, { Schema, Document } from "mongoose";
import { OrderProps, OrderStatus } from "../../domain/entities/Order";

type OrderDocument = OrderProps & Document;

const OrderSchema = new Schema<OrderDocument>(
  {
    orderId: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    productId: { type: String, required: true },
    customerId: { type: String, required: true },
    sellerId: { type: String, required: true },
    status: { type: String, enum: Object.values(OrderStatus), required: true },
  },
  { timestamps: true }
);

export const OrderModel = mongoose.model<OrderDocument>("Order", OrderSchema);