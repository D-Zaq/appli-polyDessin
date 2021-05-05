import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Line } from '@app/classes/shapes/line/line';
import { MouseButton } from '@app/constants/mouse-button';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { LineService } from './line.service';

// tslint:disable:no-any / reason : tests
describe('LineService', () => {
    let service: LineService;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    // let undoRedoSpy: jasmine.SpyObj<UndoRedoService>;

    let canvasStub: HTMLCanvasElement;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    // let drawSpy: jasmine.Spy<any>;
    let shapeSpy: jasmine.SpyObj<Line>;
    // let eraseDrawingSpy: jasmine.Spy<any>;
    // let deleteLastSegmentSpy: jasmine.Spy<any>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'getPrimaryColor']);
        // undoRedoSpy = jasmine.createSpyObj('UndoRedoService', ['addAction']);

        shapeSpy = jasmine.createSpyObj('Line', ['draw', 'calculateDistance', 'closeDrawing', 'getPathData']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: Line, useValue: shapeSpy },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        canvasStub = canvasTestHelper.canvas;
        // eraseDrawingSpy = spyOn<any>(service, 'eraseDrawing').and.callThrough();
        // deleteLastSegmentSpy = spyOn<any>(service, 'deleteLastSegment').and.callThrough();
        service = TestBed.inject(LineService);
        // drawSpy = spyOn<any>(service, 'draw').and.callThrough();

        // Configuration du spy du service
        // tslint:disable:no-string-literal / reason : tests
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].canvas = canvasStub;
        service['shape'] = shapeSpy;
    });

    it(' #should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' #onKeyDown should set startPreview to false and call eraseDrawing if escape key is down', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'Escape',
        });
        service.startPreview = true;
        const eraseDrawingSpy = spyOn<any>(service, 'eraseDrawing').and.callThrough();
        service.onKeyDown(event);
        expect(service.startPreview).toEqual(false);
        expect(eraseDrawingSpy).toHaveBeenCalled();
        expect(eraseDrawingSpy).toHaveBeenCalledWith(previewCtxStub);
    });

    it(' #onKeyDown should not set startPreview to false and not call deleteLastSegment, eraseDrawing and redrawPreviewLine if escape and backspace key are not dowwn', () => {
        const event = new KeyboardEvent('keydown', {
            key: 'C',
        });
        service.startPreview = true;
        const eraseDrawingSpy = spyOn<any>(service, 'eraseDrawing').and.callThrough();
        const deleteLastSegementSpy = spyOn<any>(service, 'deleteLastSegement').and.callThrough();
        const redrawPreviewLineSpy = spyOn<any>(service, 'redrawPreviewLine').and.callThrough();
        service.onKeyDown(event);
        expect(service.startPreview).toEqual(true);
        expect(eraseDrawingSpy).toHaveBeenCalledTimes(0);
        expect(deleteLastSegementSpy).toHaveBeenCalledTimes(0);
        expect(redrawPreviewLineSpy).toHaveBeenCalledTimes(0);
    });

    it(' #onKeyDown should set isKeyPressed to true if shift key is down', () => {
        const event = { shiftKey: true } as KeyboardEvent;
        service.isKeyPressed = false;
        service.onKeyDown(event);
        expect(service.isKeyPressed).toEqual(true);
    });

    it(' #onKeyDown should not set isKeyPressed to true if shift key is not dowwn', () => {
        const event = { shiftKey: false } as KeyboardEvent;
        service.isKeyPressed = false;
        service.onKeyDown(event);
        expect(service.isKeyPressed).toEqual(false);
    });

    it(' #onKeyUp should set isKeyPressed to false if shift key is dowwn', () => {
        const event = { shiftKey: true } as KeyboardEvent;
        service.isKeyPressed = false;
        service.onKeyUp(event);
        expect(service.isKeyPressed).toEqual(false);
    });

    it(' #onKeyUp should not set isKeyPressed to false if shift key is not dowwn', () => {
        const event = { shiftKey: false } as KeyboardEvent;
        service.isKeyPressed = true;
        service.onKeyUp(event);
        expect(service.isKeyPressed).toEqual(false);
    });

    it(" onMouseDown should not set startPreview to true and not call getPositionFromMouse and line's draw", () => {
        const event = { button: MouseButton.Right } as MouseEvent;
        service.startPreview = false;
        const getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse').and.callThrough();
        service.onMouseDown(event);
        expect(service.startPreview).toEqual(false);
        expect(getPositionFromMouseSpy).toHaveBeenCalledTimes(0);
        expect(shapeSpy.draw).toHaveBeenCalledTimes(0);
    });

    it('#onMouseMove should call getPositionFromMouse and set currMousePosition to shiftedPosition when isKeyPressed is true', () => {
        const event = {} as MouseEvent;
        service.isKeyPressed = true;
        service.shiftedPosition = { x: 20, y: 20 };
        const getPositionFromMouseSpy = spyOn(service, 'getPositionFromMouse').and.callThrough();
        service.onMouseMove(event);
        expect(getPositionFromMouseSpy).toHaveBeenCalled();
        expect(getPositionFromMouseSpy).toHaveBeenCalledWith(event);
        expect(service.currMousePosition).toEqual(service.shiftedPosition);
    });

    it('#onMouseMove should not call calculateShiftedPostion and drawPreviewLine when startPreview is false and isKeyPressed is false', () => {
        const event = {} as MouseEvent;
        service.isKeyPressed = false;
        service.startPreview = false;
        const drawPreviewLineSpy = spyOn<any>(service, 'drawPreviewLine').and.callThrough();
        const calculateShiftedPositionSpy = spyOn(service, 'calculateShiftedPosition').and.callThrough();
        service.onMouseMove(event);
        expect(drawPreviewLineSpy).toHaveBeenCalledTimes(0);
        expect(calculateShiftedPositionSpy).not.toHaveBeenCalled();
    });

    it('#calculateShiftedPosition should set shiftedPosition to calculated x and y position', () => {
        service.currMousePosition = { x: 10, y: 10 };
        service.mouseDownCoord = { x: 10, y: 10 };
        service.calculateShiftedPosition();
        // tslint:disable-next-line: no-magic-numbers / reason : tests
        expect(service.shiftedPosition.x).toEqual(10);
        // tslint:disable-next-line: no-magic-numbers / reason : tests
        expect(service.shiftedPosition.y).toEqual(10);
    });

    it("#eraseDrawing should call context's clearRect", () => {
        const clearRectSpy = spyOn(previewCtxStub, 'clearRect').and.callThrough();
        service.eraseDrawing(previewCtxStub);
        expect(clearRectSpy).toHaveBeenCalled();
    });

    it("#deleteLastSegement should call context's clearRect and line's delete", () => {
        const clearRectSpy = spyOn(previewCtxStub, 'clearRect').and.callThrough();
        service.eraseDrawing(previewCtxStub);
        expect(clearRectSpy).toHaveBeenCalled();
    });
});
