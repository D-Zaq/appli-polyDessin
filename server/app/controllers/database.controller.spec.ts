import { expect } from 'chai';
import * as supertest from 'supertest';
import { Stubbed, testingContainer } from '../../test/test-utils';
import { Application } from '../app';
import { DatabaseService } from '../services/database.service';
import { TYPES } from '../types';

// tslint:disable:no-any
const HTTP_STATUS_OK = 200;
const HTTP_STATUS_CREATED = 201;
const HTTP_NOT_FOUND = 404;

describe('DatabaseController', () => {
    // const baseMessage = { title: 'Home page', body: 'If this message appears, your request is invalid' } as Message;
    let databaseService: Stubbed<DatabaseService>;
    let app: Express.Application;

    beforeEach(async () => {
        const [container, sandbox] = await testingContainer();
        const aboutMessage = {};
        container.rebind(TYPES.DatabaseService).toConstantValue({
            // homePage: sandbox.stub().resolves(baseMessage),
            getAllDrawings: sandbox.stub(),
            getDrawing: sandbox.stub().resolves(aboutMessage),
            addDrawing: sandbox.stub(),
            deleteDrawing: sandbox.stub(),
            modifyDrawing: sandbox.stub(),
        });
        databaseService = container.get(TYPES.DatabaseService);
        app = container.get<Application>(TYPES.Application).app;
    });

    it('should return message from database service on valid get request to all drawings', async () => {
        const infoMessage = { title: 'all drawings' };
        databaseService.getAllDrawings.resolves(infoMessage);
        return supertest(app)
            .get('/log2990/polyDessin/Drawings')
            .expect(HTTP_STATUS_OK)
            .then((response: any) => {
                expect(response.body).to.deep.equal(infoMessage);
            });
    });

    it('should catch error when rejected for all drawings', async () => {
        databaseService.getAllDrawings.rejects(new Error('error'));
        return supertest(app).get('/log2990/polyDessin/Drawings').expect(HTTP_NOT_FOUND);
    });

    it('should return message from database service on valid post request to add one drawing', async () => {
        const aboutMessage = {};
        databaseService.addDrawing.resolves(aboutMessage);
        return supertest(app)
            .post('/log2990/polyDessin/drawing/addDrawing')
            .expect(HTTP_STATUS_CREATED)
            .then((response: any) => {
                expect(response.body).to.deep.equal(aboutMessage);
            });
    });

    it('should catch error when rejected when adding drawing', async () => {
        databaseService.addDrawing.rejects(new Error('error'));
        return supertest(app).post('/log2990/polyDessin/drawing/addDrawing').expect(HTTP_NOT_FOUND);
    });

    it('should return message from database service on valid get request to one drawing', async () => {
        // const aboutMessage = {};
        // databaseService.getDrawing.resolves(aboutMessage);
        return supertest(app)
            .get('/log2990/polyDessin/drawing/test')
            .expect(HTTP_STATUS_OK)
            .then((response: any) => {
                expect(response.body).to.deep.equal({});
            });
    });

    it('should catch error when rejected for one specific drawing', async () => {
        databaseService.getDrawing.rejects(new Error('error'));
        return supertest(app).get('/log2990/polyDessin/drawing/test').expect(HTTP_NOT_FOUND);
    });

    it('should return message from database service on valid delete request to delete one drawing', async () => {
        const aboutMessage = {};
        databaseService.deleteDrawing.resolves(aboutMessage);
        return supertest(app)
            .delete('/log2990/polyDessin/drawing/delete/test')
            .expect(HTTP_STATUS_OK)
            .then((response: any) => {
                expect(response.body).to.deep.equal(aboutMessage);
            });
    });

    it('should catch error when rejected for delete of one drawing', async () => {
        databaseService.deleteDrawing.rejects(new Error('error'));
        return supertest(app).delete('/log2990/polyDessin/drawing/delete/testing').expect(HTTP_NOT_FOUND);
    });
});
