import config from '@app/config';
import { Drawing } from '@common/communication/drawing';
import { injectable } from 'inversify';
import { Collection, MongoClient, MongoClientOptions } from 'mongodb';
// import * as Mongoose from 'mongoose';
// let database: Mongoose.Connection;

// add your own uri below
const DATABASE_URL = `mongodb+srv://${config.userName}:${config.password}@${config.host}/${config.name}?retryWrites=true&w=majority`;
const DATABASE_COLLECTION = 'Drawing';
const DATABASE_NAME = 'drawingDatabase';
// const statusN = 500;

@injectable()
export class DatabaseService {
    private collection: Collection<Drawing>;

    private options: MongoClientOptions = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };

    constructor() {
        MongoClient.connect(DATABASE_URL, this.options).then((client: MongoClient) => {
            this.collection = client.db(DATABASE_NAME).collection(DATABASE_COLLECTION);
        });
    }

    async addDrawing(drawing: Drawing): Promise<void> {
        if (this.isTitleValid(drawing.name) && this.isTagsValid(drawing.tags)) {
            await this.collection.insertOne(drawing);
        }
    }

    async getDrawing(drwgName: string): Promise<Drawing> {
        return this.collection.findOne({ name: drwgName }).then((drawing: Drawing) => {
            return drawing;
        });
    }

    async getAllDrawings(): Promise<Drawing[]> {
        return this.collection
            .find({})
            .toArray()
            .then((drawings: Drawing[]) => {
                return drawings;
            });
    }

    async deleteDrawing(id: string): Promise<void> {
        this.collection.findOneAndDelete({ _id: id });
    }

    isTitleValid(title: string): boolean {
        const titleFormControl = new RegExp('^[A-Za-z0-9ñÑáéèêíóôúûÁÉÈÊÍÓÔÚÛ]+$');
        return titleFormControl.test(title);
    }

    isTagsValid(tags: string[]): boolean {
        let isTagValid = true;
        const tagFormControl = new RegExp('^[A-Za-z0-9ñÑáéèêíóôúûÁÉÈÊÍÓÔÚÛ]+$');
        for (const tag of tags) {
            if (!tagFormControl.test(tag)) {
                isTagValid = false;
                break;
            }
        }
        return isTagValid;
    }
}
