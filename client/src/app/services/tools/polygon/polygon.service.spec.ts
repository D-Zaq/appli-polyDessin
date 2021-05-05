import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Polygon } from '@app/classes/shapes/polygon/polygon';
import { MouseButton } from '@app/constants/mouse-button';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { PolygonService } from './polygon.service';

describe('PolygonService', () => {
    let service: PolygonService;
    let mouseEventLClick: MouseEvent;
    let mouseEventRClick: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let polygonSpy: jasmine.SpyObj<Polygon>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let canvasStub: HTMLCanvasElement;
    let undoRedoSpy: jasmine.SpyObj<UndoRedoService>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'getPrimaryColor', 'getSecondaryColor']);
        polygonSpy = jasmine.createSpyObj('Polygon', ['updateDimensions', 'draw', 'drawPerimeter']);
        undoRedoSpy = jasmine.createSpyObj('UndoRedoService', ['addAction']);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: Polygon, useValue: polygonSpy },
                { provide: UndoRedoService, useValue: undoRedoSpy },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        canvasStub = canvasTestHelper.canvas;

        service = TestBed.inject(PolygonService);

        // Configuration du spy du service
        // tslint:disable:no-string-literal // Reason: tests
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].canvas = canvasStub;
        service['shape'] = polygonSpy;

        mouseEventLClick = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;

        mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Right,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' onMouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEventLClick);
        expect(service.mouseDown).toEqual(true);
    });

    it(' onMouseDown should instanciate Tool.shape to Polygon', () => {
        service.onMouseDown(mouseEventLClick);
        expect(service.shape).not.toBeNull();
    });

    it(' onMouseDown should set mouseDown property to false on right click', () => {
        service.onMouseDown(mouseEventRClick);
        expect(service.mouseDown).toEqual(false);
    });

    it(' onMouseUp should set mouseDown property to false', () => {
        service.onMouseUp(mouseEventLClick);
        expect(service.mouseDown).toEqual(false);
    });

    it(' onMouseUp should add an ActionShape to the undoredo service actions array', () => {
        service.mouseDown = true;
        service.onMouseUp(mouseEventLClick);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(undoRedoSpy.addAction).toHaveBeenCalled();
    });

    it(' onMouseMove should call Polygon.draw if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onMouseMove(mouseEventLClick);

        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(polygonSpy.updateDimensions).toHaveBeenCalled();
        expect(polygonSpy.draw).toHaveBeenCalled();
        expect(polygonSpy.drawPerimeter).toHaveBeenCalled();
    });

    it(' onMouseMove should not call Polygon.draw if mouse was not already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = false;

        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(polygonSpy.updateDimensions).not.toHaveBeenCalled();
        expect(polygonSpy.draw).not.toHaveBeenCalled();
        expect(polygonSpy.drawPerimeter).not.toHaveBeenCalled();
    });
});
