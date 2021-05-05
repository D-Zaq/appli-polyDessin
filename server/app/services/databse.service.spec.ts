import { Drawing } from '@common/communication/drawing';
import { expect } from 'chai';
import { Collection, MongoClient, MongoClientOptions } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { DatabaseService } from './database.service';

// tslint:disable:no-any
const DATABASE_NAME = 'drawingDatabase';
const DATABASE_COLLECTION = 'Drawing';

let mongoServer: any;
const options: MongoClientOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};
let collection: Collection<Drawing>;
let clientTest: MongoClient;

const drawingTestOne: Drawing = {
    name: 'cercle',
    tags: ['yb', 'zd'],
    _id: '123456987654567',
    url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAzoAAAHyCAYAAAAjlbtEAAAg...',
};

const drawingTestTwo: Drawing = {
    name: 'test2',
    tags: ['allo', 'bib'],
    _id: '0.16270645495622826mn',
    url: 'data:image/png;base64,iVBORw0KGgoAAAAUgAAAzoAAAHyCAYAAAAjlbtEAAAg..',
};

const drawingTestFalse: Drawing = {
    name: 'è23é2é3',
    tags: ['?&%é34e'],
    _id: '',
    url: '',
};

let databaseService: DatabaseService;

before(async () => {
    mongoServer = new MongoMemoryServer();
    const mongoUri = await mongoServer.getUri();
    await MongoClient.connect(mongoUri, options).then((client: MongoClient) => {
        collection = client.db(DATABASE_NAME).collection(DATABASE_COLLECTION);
        clientTest = client;
    });
    databaseService = new DatabaseService();
    // tslint:disable-next-line:no-string-literal
    databaseService['collection'] = collection;
});

after(async () => {
    // tslint:disable-next-line:no-string-literal
    await databaseService['collection'].deleteMany({});
    await clientTest.close();
    await mongoServer.stop();
});

describe('database service', () => {
    it('should get all drawings', async () => {
        databaseService.addDrawing(drawingTestTwo);
        const expectedDrawings: Drawing[] = new Array<Drawing>();
        expectedDrawings.push(drawingTestTwo);
        return databaseService.getAllDrawings().then((result: Drawing[]) => {
            databaseService.deleteDrawing(drawingTestTwo._id);
            return expect(result[0].name).to.equals(expectedDrawings[0].name);
        });
    });

    it('should get one drawing', async () => {
        databaseService.addDrawing(drawingTestTwo);
        return databaseService.getDrawing(String(drawingTestTwo.name)).then((result: Drawing) => {
            return expect(result.name).to.equals(drawingTestTwo.name);
        });
    });

    it('should not add one drawing', async () => {
        databaseService.addDrawing(drawingTestFalse);
        return databaseService.getDrawing(String(drawingTestFalse.name)).then((result: Drawing) => {
            return expect(result).to.equals(null);
        });
    });

    it('should delete one drawing', async () => {
        databaseService.deleteDrawing(String(drawingTestOne._id));
        return databaseService.getDrawing(String(drawingTestOne._id)).then((result: Drawing) => {
            return expect(result).to.equals(null);
        });
    });
});
