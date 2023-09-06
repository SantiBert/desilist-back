import axios from 'axios';
import config from '@config';
import {GetExistChatsResponse} from '../constants/chats';

const APP_ENV_BACK = config.backend.url;

export const chat = async (
  from_id: string,
  listing_id: number | string
): Promise<any> =>
  (
    await axios.get<GetExistChatsResponse>(`${APP_ENV_BACK}/chats/exist`, {
      headers: {
        Accept: 'application/json'
      },
      params: {
        from_id,
        listing_id
      }
    })
  ).data.data;

export const existChat = async (user_id, listing_id): Promise<boolean> => {
  if (await chat(user_id, listing_id)) {
    return true;
  }
  return false;
};

export const createChat = async (data: any): Promise<any> =>
  await axios.post(`${APP_ENV_BACK}/chats`, {
    data
  });
export const createMessage = async (data: any): Promise<any> =>
  await axios.post(`${APP_ENV_BACK}/chats/message`, {
    data
  });

export const findRoom = async (room: string): Promise<any> =>
  (
    await axios.get<any>(`${APP_ENV_BACK}/chats/room/exist`, {
      headers: {
        Accept: 'application/json'
      },
      params: {
        room
      }
    })
  ).data;

export const getRoomLastMsg = async (token: string): Promise<any> =>
  (
    await axios.get(`${APP_ENV_BACK}/chats`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json'
      }
    })
  ).data;
