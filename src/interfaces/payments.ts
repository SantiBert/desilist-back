export interface ICard {
  number: string;
  exp_month: number;
  exp_year: number;
  cvc: string;
}

export interface ICardPaymentOptions {
  cvc_token_id: string;
}

export interface IPaymentAddress {
  city: string;
  country: string;
  line1: string;
  line2: string;
  postal_code: string;
  state: string;
}

export interface IBillingDetails {
  address: IPaymentAddress;
  email: string;
  name: string;
  phone: string;
}
