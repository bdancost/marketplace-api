export interface PaymentOrderMessage {
  orderId: string;
  userId: string;
  amount: number;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  metadata: {
    service: string;
    timestamp: string;
  };
  paymentMethod: string;
  description?: string;
  createdAt?: Date;
}
