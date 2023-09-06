export interface GetAllEvent {
    events: any[];
    highlighted: number;
    total: number;
    cursor: number;
    pages: number;
  }
  export interface GetAllEventCsv {
    events: any[];
  }