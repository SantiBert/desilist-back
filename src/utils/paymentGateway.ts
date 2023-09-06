export enum PAYMENT_GATEWAYS {
  STRIPE = 'stripe'
}

export abstract class PaymentGateway {
  private apiKey: any;
  public constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public abstract createPayment(
    amount: number,
    currency: string,
    paymentMethodType: string[],
    customerId: string,
    paymentMethodOptions?: any
  ): Promise<any>;

  public abstract confirmPayment(
    id: string,
    paymentMethodId: string,
    user: any
  ): Promise<void>;

  public abstract cancelPayment(id: string, reason?: string): Promise<void>;
}
