import {io, Socket} from 'socket.io-client';
import {logger} from '@utils/logger';

export class SocketClientService {
  public constructor(
    uri: string,
    transports: string[] = ['polling', 'websocket']
  ) {
    this.socket = io(uri, {transports});
    this.connected = false;
  }

  private socket: Socket;
  private client: Socket;
  private connected: boolean;

  public connect(): void {
    this.client = this.socket.connect();
    this.client.on('connect', () => {
      logger.info('Connected');
      this.connected = true;
      this.client.on('disconnect', function (reason: any) {
        logger.info(reason);
        this.connected = false;
      });
    });
  }

  public emitEvent(name: string, ...args: any[]): void {
    if (this.connected) {
      this.client.emit(name, args);
    }
  }
}
