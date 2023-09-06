import App from '@/app';
import validateEnv from '@/utils/validateEnv';
import HealthRoute from '@/routes/health.route';
import {Server} from 'socket.io';
import http from 'http';
import {logger} from '@/utils/logger';
import config from '@config';
import {userJoin, getUsers, userLeft} from './utils/user';
import {
  createChat,
  createMessage,
  findRoom,
  getRoomLastMsg
} from './utils/chat';

validateEnv();

const APP_ENV = config.environment;
const BASE_PATH = config.app.base_path;
const APP_ENV_FRONT = config.frontend.url;
const SIO_BASE_PATH = BASE_PATH === '/' ? '' : BASE_PATH;

const app = new App([new HealthRoute()]);
const httpServer = http.createServer(app.getServer());
const port = app.getPort();

httpServer.listen(port, () => {
  logger.info(`=================================`);
  logger.info(`======= ENV: ${APP_ENV} =======`);
  logger.info(`🚀 App listening on the port ${port}`);
  logger.info(`=================================`);
});

const io = new Server(httpServer, {
  cors: {
    origin: `${APP_ENV_FRONT}`
  },
  transports: ['polling', 'websocket'],
  path: `${SIO_BASE_PATH}/socket.io`
});

io.on('connection', (socket) => {
  socket.on(
    'handle-connection',
    async (
      listing_id: string,
      user: string,
      userTo: string,
      myToken: string
    ) => {
      let channel: string;
      if (!listing_id) {
        channel = user + '?user=' + userTo; // channel admin
      } else {
        channel = user + '?listing=' + listing_id; // channel user
      }
      socket.join(channel);
      //console.info(channel, user);
      if (!userJoin(socket.id, channel)) {
        console.log('info:', channel, user);
        socket.emit('room-already-exist');
      } else {
        io.to(channel).emit('get-connected-users', getUsers());
        const chat = await findRoom(channel);
        if (!chat) {
          let data: any;
          if (!listing_id) {
            data = {
              listing_id: listing_id,
              room: channel,
              from_id: user,
              to_id: userTo
            };
          } else {
            data = {
              listing_id: listing_id,
              room: channel,
              from_id: user
            };
          }
          await createChat(data);
          socket.emit('room-created-successfully');
        }
      }
    }
  );
  let channel = '';
  socket.on('channel-changed', async (channelId: string) => {
    channel = channelId;
    console.log('NUEVO CANAL ', channel);
  });

  socket.on(
    'message',
    async (message: {
      listingId: string;
      message: string;
      userId: string;
      room: string;
      myToken: string;
    }) => {
      const currentChannel: string | number = message.room;
      const user: string = message.userId;
      const chats = await findRoom(currentChannel);
      const chatId: number = chats.id;
      const data = {
        chat_id: chatId,
        message: message.message,
        sent_by: user
      };
      await createMessage(data);
      socket.broadcast.to(currentChannel).emit('receive-message');
    }
  );
  socket.on('token', async (token) => {
    if (token) {
      const allChats = await getRoomLastMsg(token);
      socket.emit('new-chats', allChats);
    }
  });

  socket.on('disconnect', () => {
    userLeft(socket.id);
  });
});
