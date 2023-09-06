import App from '@/app';
import validateEnv from '@/utils/validateEnv';
import HealthRoute from '@/routes/health.route';
import {Server} from 'socket.io';
import http from 'http';
import {logger} from '@/utils/logger';
import config from '@config';

validateEnv();

const APP_ENV = config.environment;
const BASE_PATH = config.app.base_path;
const SIO_BASE_PATH = BASE_PATH === '/' ? '' : BASE_PATH;
const CORS_ORIGIN = config.app.cors_origin;

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
    origin: CORS_ORIGIN
  },
  transports: ['polling', 'websocket'],
  path: `${SIO_BASE_PATH}/socket.io`
});

io.on('connection', (socket) => {
  // const transport = socket.conn.transport.name; // in most cases, "polling"
  socket.on('upgrade', () => {
    const upgradedTransport = socket.conn.transport.name; // in most cases, "websocket"
    console.log('Upgraded transport: ', upgradedTransport);
  });

  socket.on('notification', (data) => {
    console.log(`notification ${data.message}`);
    socket.broadcast.emit('notification', {
      channel: data?.[0]?.channel,
      type: data?.[0]?.type,
      message: data?.[0]?.message
    });
  });

  socket.on('broadcast', (data) => {
    console.log(`broadcast ${data.message}`);
    socket.broadcast.emit('broadcast', {
      message: data.message
    });
  });
  // agregué esto por si falla la conexion y queda persistiendo */
  // deberiamos sacalo, porque borra todas las conexiones
  /*
  socket.on('error', (err) => {
    if (err) {
      socket.disconnect();
    }
  });
  */
});
