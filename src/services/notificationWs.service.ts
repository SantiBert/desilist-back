import {SocketClientService} from '@services/socket.service';

const NOTIFICATION_EVENT_NAME = 'notification';
const BROADCAST_EVENT_NAME = 'broadcast';

export class NotificationWs {
  public constructor(uri: string) {
    this.socket = new SocketClientService(uri, ['websocket']);
    this.socket.connect();
  }

  private socket: SocketClientService;
  private enabled: boolean;

  public sendNotification(
    channel: string,
    type: string,
    message: string
  ): void {
    this.socket.emitEvent(NOTIFICATION_EVENT_NAME, {
      channel,
      type,
      message
    });
  }

  public broadcast(message: string): void {
    this.socket.emitEvent(BROADCAST_EVENT_NAME, {
      type: 'global',
      message
    });
  }
}
