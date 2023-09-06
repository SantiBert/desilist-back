import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import config from '@config';
import {Routes} from '@interfaces/routes.interface';
import errorMiddleware from '@middlewares/error.middleware';
import {logger, stream} from '@utils/logger';
import notifications from './notifications';

const BASE_PATH = config.app.base_path;
const SWAGGER_BASE_PATH = BASE_PATH === '/' ? '' : BASE_PATH;
const APP_PORT = config.app.port;
const APP_ENV = config.environment;
const REQUEST_SIZE = config.app.request_size;
const UPLOAD_SIZE = config.app.upload_size;
const BIG_UPLOAD_SIZE = config.app.big_upload_size;

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;
  public socket: any;
  public bigUploadEndpoints = ['listings', 'admin/listings'];
  public uploadEndpoints = ['signup', 'users'];

  public constructor(routes: Routes[]) {
    this.app = express();
    this.env = APP_ENV || 'development';
    this.port = APP_PORT || 3000;

    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeNotificationService();
    this.initializeSwagger();
    this.initializeErrorHandling();
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }

  public getServer(): express.Application {
    return this.app;
  }

  private initializeMiddlewares(): void {
    this.app.use(morgan(config.app.log_format, {stream}));
    this.app.use(
      cors({
        origin: config.app.cors_origin,
        credentials: config.app.cors_credentials
      })
    );
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    // the endpoint scoped limit must be set before the global limit
    this.uploadEndpoints.forEach((endpoint) => {
      this.app.use(
        `/${endpoint}`,
        express.json({
          limit: `${REQUEST_SIZE + UPLOAD_SIZE}kb`
        })
      );
    });
    this.bigUploadEndpoints.forEach((endpoint) => {
      this.app.use(
        `/${endpoint}`,
        express.json({
          limit: `${REQUEST_SIZE + BIG_UPLOAD_SIZE}kb`
        })
      );
    });
    this.app.use(express.json({limit: `${config.app.request_size}kb`}));
    this.app.use(express.urlencoded({extended: true}));
    this.app.use(cookieParser());
  }

  private initializeRoutes(routes: Routes[]): void {
    routes.forEach((route) => {
      this.app.use(BASE_PATH, route.router);
    });
  }

  private initializeNotificationService(): void {
    this.app.locals.notifications = notifications;
  }

  private initializeSwagger(): void {
    const options = {
      swaggerDefinition: {
        openapi: '3.0.0',
        info: {
          title: 'DESILIST API',
          version: '1.0.0',
          description: 'Desilist docs'
        },
        contact: {
          name: 'Desilist',
          url: ''
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT'
            }
          }
        },
        servers: [
          {
            url: `http://localhost:${this.port}${SWAGGER_BASE_PATH}`,
            description: 'Local development server'
          },
          {
            url: `https://dev.desilist.quorumit.com/api${SWAGGER_BASE_PATH}`,
            description: 'Development server'
          }
        ],
        security: [
          {
            bearerAuth: []
          }
        ]
      },
      apis: ['./src/docs/*.ts']
    };

    const specs = swaggerJSDoc(options);
    this.app.use('/docs/json', (req, res, next) => {
      try {
        res.status(200).json(specs);
      } catch (err) {
        next(err);
      }
    });
    this.app.use(`/docs`, swaggerUi.serve, swaggerUi.setup(specs));
  }

  private initializeErrorHandling(): void {
    this.app.use(errorMiddleware);
  }
}

export default App;
