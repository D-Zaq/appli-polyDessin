import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as express from 'express';
import { inject, injectable } from 'inversify';
import * as logger from 'morgan';
import * as swaggerJSDoc from 'swagger-jsdoc';
import * as swaggerUi from 'swagger-ui-express';
import { HttpException } from './classes/http.exception';
import { NOT_FOUND_HTTP_STATUS } from './constants';
import { DatabaseController } from './controllers/database.controller';
import { DateController } from './controllers/date.controller';
import { IndexController } from './controllers/index.controller';
import { TYPES } from './types';
// import { TYPES } from './types';

// export const TYPES = {
//     Server: Symbol('Server'),
//     Application: Symbol('Application'),
//     IndexController: Symbol('IndexController'),
//     DateController: Symbol('DateController'),
//     IndexService: Symbol('IndexService'),
//     DateService: Symbol('DateService'),
//     DatabaseService: Symbol('DatabaseService'),
//     DatabaseController: Symbol('DatabaseController'),
// };
@injectable()
export class Application {
    private readonly internalError: number = 500;
    private readonly swaggerOptions: swaggerJSDoc.Options;
    app: express.Application;

    constructor(
        @inject(TYPES.IndexController) private indexController: IndexController,
        @inject(TYPES.DateController) private dateController: DateController,
        @inject(TYPES.DatabaseController) private databaseController: DatabaseController,
    ) {
        this.app = express();

        this.swaggerOptions = {
            swaggerDefinition: {
                openapi: '3.0.0',
                info: {
                    title: 'Cadriciel Serveur',
                    version: '1.0.0',
                },
            },
            apis: ['**/*.ts'],
        };

        this.config();

        this.bindRoutes();
    }

    private config(): void {
        // Middlewares configuration
        this.app.use(logger('dev'));
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(cookieParser());
        this.app.use(cors());
    }

    bindRoutes(): void {
        // Notre application utilise le routeur de notre API `Index`
        this.app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerJSDoc(this.swaggerOptions)));
        this.app.use('/api/index', this.indexController.router);
        this.app.use('/api/date', this.dateController.router);
        this.app.use('/log2990/polyDessin', this.databaseController.router);
        this.errorHandling();
    }

    private errorHandling(): void {
        // When previous handlers have not served a request: path wasn't found
        this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            next(new HttpException(NOT_FOUND_HTTP_STATUS, 'Not Found'));
        });

        // development error handler
        // will print stacktrace
        if (this.app.get('env') === 'development') {
            // tslint:disable-next-line:no-any / Reason: no known type
            this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
                res.status(err.status || this.internalError);
                res.send({
                    message: err.message,
                    error: err,
                });
            });
        }

        // production error handler
        // no stacktraces leaked to user (in production env only)
        this.app.use((err: HttpException, req: express.Request, res: express.Response, next: express.NextFunction) => {
            res.status(err.status || this.internalError);
            res.send({
                message: err.message,
                error: {},
            });
        });
    }
}
