import {NotificationEmitter} from '@/services/notificationEmitter.service';
import config from '@/config';

const NOTIFICATION_ENABLED = config.notification_service.enabled;

const notifications = new NotificationEmitter(NOTIFICATION_ENABLED);

export default notifications;
