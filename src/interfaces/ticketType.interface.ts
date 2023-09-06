
export interface EventTicketTypeRequest {
  event_id: number;
  type_id: number;
  name: string;
  quantity_avaible: number;
  unit_price: number;
  max_quantity_order: number;
  description: string;
  valid_for: Date[];
  active: boolean;
}
