type ExistChat = {
  from_id: string;
  listin_ig: number | string;
};

export type GetExistChatsResponse = {
  data: ExistChat[];
};
