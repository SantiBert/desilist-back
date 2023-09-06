export interface GetAllListing {
  listings: any[];
  highlighted: number;
  total: number;
  cursor: number;
  pages: number;
}
export interface GetAllListingCsv {
  listings: any[];
}
