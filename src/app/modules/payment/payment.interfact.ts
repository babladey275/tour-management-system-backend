import { Types } from "mongoose";

export enum PAYMENT_STATUS {
  PAID = "PAID",
  UNPAID = "UNPAID",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export interface IPayment {
  booking: Types.ObjectId;
  transactionId: string;
  amount: number;
  paymentGatewayData?: any;
  invoiceUrl?: string;
  status: PAYMENT_STATUS;
}
