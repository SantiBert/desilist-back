import {EventBookmark} from '@prisma/client';

export interface GetAllBookmark {
  bookmarks: EventBookmark[];
  total: number;
  cursor: number;
  pages: number;
}
