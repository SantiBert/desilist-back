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
import {Routes} from '@/interfaces/routes.interface';
import errorMiddleware from '@/middlewares/error.middleware';
import {logger, stream} from '@/utils/logger';

const BASE_PATH = config.app.base_path;
const SWAGGER_BASE_PATH = BASE_PATH === '/' ? '' : BASE_PATH;
const APP_PORT = config.app.port;
const APP_ENV = config.environment;

class App {
  public app: express.Application;
  public env: string;
  public port: number;

  public constructor(routes: Routes[]) {
    this.app = express();
    this.env = APP_ENV || 'development';
    this.port = APP_PORT || 5000;

    this.initializeMiddlewares();
    this.initializeRoutes(routes);
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

  public getPort(): number {
    return this.port;
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
    this.app.use(express.json());
    this.app.use(express.urlencoded({extended: true}));
    this.app.use(cookieParser());
  }

  private initializeRoutes(routes: Routes[]): void {
    routes.forEach((route) => {
      this.app.use(BASE_PATH, route.router);
    });
  }

  private initializeSwagger(): void {
    const options = {
      swaggerDefinition: {
        openapi: '3.0.0',
        info: {
          title: 'NOTIFICATIONS SERVICE',
          version: '1.0.0',
          description: 'Notifications docs'
        },
        contact: {
          name: 'Notifications',
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
