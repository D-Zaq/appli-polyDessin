import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { PencilStroke } from '@app/classes/shapes/pencil-stroke/pencil-stroke';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { PencilService } from './pencil.service';

// tslint:disable:no-any  / reason : tests
// tslint:disable: no-magic-numbers / reason : tests
describe('PencilService', () => {
    let service: PencilService;
    let mouseEventLClick: MouseEvent;
    let mouseEventRClick: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    let canvasStub: HTMLCanvasElement;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let pencilStrokeSpy: jasmine.SpyObj<PencilStroke>;
    let undoRedoSpy: jasmine.SpyObj<UndoRedoService>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'getPrimaryColor']);
        pencilStrokeSpy = jasmine.createSpyObj('PencilStroke', ['updateStroke', 'draw', 'clearPath']);
        undoRedoSpy = jasmine.createSpyObj('UndoRedoService', ['addAction']);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: PencilStroke, useValue: pencilStrokeSpy },
                { provide: UndoRedoService, useValue: undoRedoSpy },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        canvasStub = canvasTestHelper.canvas;
        service = TestBed.inject(PencilService);
        // Configuration du spy du service
        // tslint:disable:no-string-literal / reason : tests
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].canvas = canvasStub;
        service['shape'] = pencilStrokeSpy;

        mouseEventLClick = {
            offsetX: 25,
            offsetY: 25,
            button: 0,
        } as MouseEvent;

        mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: 1,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' onMouseDown should instanciate Tool.shape to PencilStroke', () => {
        service.onMouseDown(mouseEventLClick);
        expect(service.shape).not.toBeNull();
    });

    it(' mouseDown should set mouseDownCoord to correct position', () => {
        const expectedResult: Vec2 = { x: 25, y: 25 };
        service.onMouseDown(mouseEventLClick);
        expect(service.mouseDownCoord).toEqual(expectedResult);
    });

    it(' mouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEventLClick);
        expect(service.mouseDown).toEqual(true);
    });

    it(' mouseDown should set mouseDown property to false on right click', () => {
        service.onMouseDown(mouseEventRClick);
        expect(service.mouseDown).toEqual(false);
    });

    it(' onMouseUp should add an ActionShape to the undoredo service actions array', () => {
        service.mouseDown = true;
        service.onMouseUp(mouseEventLClick);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(undoRedoSpy.addAction).toHaveBeenCalled();
    });

    it(' onMouseUp should set mouseDown property to false', () => {
        service.mouseDown = true;
        service.mouseDownCoord = { x: 0, y: 0 };

        service.onMouseUp(mouseEventLClick);
        expect(service.mouseDown).toEqual(false);
    });

    it(' mouseUp should set mouseDown property to false on left click', () => {
        service.onMouseUp(mouseEventLClick);
        expect(service.mouseDown).toEqual(false);
    });

    it(' onMouseMove should not call pencilStroke.updateStroke if mouse was not already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = false;

        service.onMouseMove(mouseEventLClick);
        expect(pencilStrokeSpy.updateStroke).not.toHaveBeenCalled();
        expect(pencilStrokeSpy.draw).not.toHaveBeenCalled();
    });

    it(' onMouseMove should call pencilStroke.updateStroke if mouse was  already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onMouseMove(mouseEventLClick);
        expect(pencilStrokeSpy.updateStroke).toHaveBeenCalled();
        expect(pencilStrokeSpy.draw).toHaveBeenCalled();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });
});
