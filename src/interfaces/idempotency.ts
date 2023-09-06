export interface IdempotentRequest {
  id: number;
  key: string;
}

export interface IdempotentRequestParams {
  request_path: string;
  request_params: string;
}
