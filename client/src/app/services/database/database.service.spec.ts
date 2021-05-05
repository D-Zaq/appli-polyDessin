import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Drawing } from '@common/communication/drawing';
import { DatabaseService } from './database.service';

// tslint:disable: no-string-literal  / reason : tests

const drawing: Drawing = {
    name: 'test',
    tags: ['t1', 't2'],
    _id: '123456987654567',
    url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAzoAAAHyCAYAAAAjlbtEAAAg...',
};

const SEND_URL = 'http://localhost:3000/log2990/polyDessin/drawing/addDrawing';
const GET_URL = 'http://localhost:3000/log2990/polyDessin/drawing/';
const GET_ALL_URL = 'http://localhost:3000/log2990/polyDessin/Drawings';
const DELETE_URL = 'http://localhost:3000/log2990/polyDessin/drawing/delete/';
const FAILED = 400;
const SUCCESS = 201;

describe('DatabaseService', () => {
    let service: DatabaseService;
    let httpTestingController: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
        service = TestBed.inject(DatabaseService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should post successfully', () => {
        const mockResponsePost = SUCCESS;
        service.sendDrawing(drawing).subscribe((response) => {
            expect(response).toBe(SUCCESS);
        });
        const request = httpTestingController.expectOne(SEND_URL);
        expect(request.request.method).toEqual('POST');
        request.flush(mockResponsePost);
        httpTestingController.verify();
    });

    it('should get drawing successfully', () => {
        const drawingReceived: Drawing = drawing;
        service.getDrawing('cercle').subscribe((response) => {
            expect(response).toBe(drawingReceived);
        });
        const request = httpTestingController.expectOne(GET_URL + 'cercle');
        expect(request.request.method).toEqual('GET');
        request.flush(drawingReceived);
        httpTestingController.verify();
    });

    it('should get all drawings successfully', () => {
        const drawingsArray: Drawing[] = new Array<Drawing>();
        const drawingReceived: Drawing = drawing;
        drawingsArray.push(drawingReceived);
        service.getDrawings().subscribe((response) => {
            expect(response).toBe(drawingsArray);
        });
        const request = httpTestingController.expectOne(GET_ALL_URL);
        expect(request.request.method).toEqual('GET');
        request.flush(drawingsArray);
        httpTestingController.verify();
    });

    it('should delete drawing successfully', () => {
        const drawingD: Drawing = drawing;
        service.deleteDrawing('cercle').subscribe((response) => {
            expect(response).toBe(drawingD);
        });
        const request = httpTestingController.expectOne(DELETE_URL + 'cercle');
        expect(request.request.method).toEqual('DELETE');
        request.flush(drawingD);
        httpTestingController.verify();
    });

    it('should handle errors', () => {
        service.getDrawing('tripode').subscribe((response) => {
            expect(response).toBe(FAILED);
        });
        httpTestingController.expectOne(GET_URL + 'tripode').error(new ErrorEvent('error'), { status: 400, statusText: 'Bad Request' });
        httpTestingController.verify();

        service.sendDrawing(drawing).subscribe((response) => {
            expect(response).toBe(FAILED);
        });
        httpTestingController.expectOne(SEND_URL).error(new ErrorEvent('error'), { status: 400, statusText: 'Bad Request' });
        httpTestingController.verify();

        service.deleteDrawing('tripode').subscribe((response) => {
            expect(response).toBe(FAILED);
        });
        httpTestingController.expectOne(DELETE_URL + 'tripode').error(new ErrorEvent('error'), { status: 400, statusText: 'Bad Request' });
        httpTestingController.verify();

        service.getDrawings().subscribe((response) => {
            expect(response).toBe(FAILED);
        });
        httpTestingController.expectOne(GET_ALL_URL).error(new ErrorEvent('error'), { status: 400, statusText: 'Bad Request' });
        httpTestingController.verify();
    });
});
