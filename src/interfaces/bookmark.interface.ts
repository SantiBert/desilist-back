import {Bookmark} from '@prisma/client';

export interface GetAllBookmark {
  bookmarks: Bookmark[];
  total: number;
  cursor: number;
  pages: number;
}
