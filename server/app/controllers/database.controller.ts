import { CREATED_HTTP_STATUS, NOT_FOUND_HTTP_STATUS, OK_HTTP_STATUS } from '@app/constants';
import { DatabaseService } from '@app/services/database.service';
import { TYPES } from '@app/types';
import { Drawing } from '@common/communication/drawing';
import { NextFunction, Request, Response, Router } from 'express';
import { inject, injectable } from 'inversify';

@injectable()
export class DatabaseController {
    router: Router;

    constructor(@inject(TYPES.DatabaseService) private databaseService: DatabaseService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        // TODO : Find a way of getting an array of parameters

        this.router.get('/Drawings', async (req: Request, res: Response, next: NextFunction) => {
            this.databaseService
                .getAllDrawings()
                .then((drawings: Drawing[]) => {
                    res.json(drawings);
                })
                .catch((error: Error) => {
                    res.status(NOT_FOUND_HTTP_STATUS).send(error.message);
                });
        });

        this.router.get('/drawing/:name', async (req: Request, res: Response, next: NextFunction) => {
            this.databaseService
                .getDrawing(req.params.name)
                .then((drawing: Drawing) => {
                    res.json(drawing);
                })
                .catch((error: Error) => {
                    res.status(NOT_FOUND_HTTP_STATUS).send(error.message);
                });
        });

        this.router.post('/drawing/addDrawing', async (req: Request, res: Response, next: NextFunction) => {
            this.databaseService
                .addDrawing(req.body)
                .then(() => {
                    res.sendStatus(CREATED_HTTP_STATUS).send();
                })
                .catch((error: Error) => {
                    res.status(NOT_FOUND_HTTP_STATUS).send(error.message);
                });
        });

        this.router.delete('/drawing/delete/:id', async (req: Request, res: Response, next: NextFunction) => {
            this.databaseService
                .deleteDrawing(req.params.id)
                .then(() => {
                    res.sendStatus(OK_HTTP_STATUS).send();
                })
                .catch((error: Error) => {
                    res.status(NOT_FOUND_HTTP_STATUS).send(error.message);
                });
        });
    }
}
