import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Ellipse } from '@app/classes/shapes/ellipse/ellipse';
import { MouseButton } from '@app/constants/mouse-button';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { EllipseService } from './ellipse.service';

describe('EllipseService', () => {
    let service: EllipseService;
    let mouseEventLClick: MouseEvent;
    let mouseEventRClick: MouseEvent;
    let keyUpEvent: KeyboardEvent;
    let keyDownEvent: KeyboardEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let ellipseSpy: jasmine.SpyObj<Ellipse>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let canvasStub: HTMLCanvasElement;
    let undoRedoSpy: jasmine.SpyObj<UndoRedoService>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'getPrimaryColor', 'getSecondaryColor']);
        ellipseSpy = jasmine.createSpyObj('Ellipse', ['updateDimensions', 'draw', 'drawPerimeter']);
        undoRedoSpy = jasmine.createSpyObj('UndoRedoService', ['addAction']);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: Ellipse, useValue: ellipseSpy },
                { provide: UndoRedoService, useValue: undoRedoSpy },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        canvasStub = canvasTestHelper.canvas;

        service = TestBed.inject(EllipseService);

        // tslint:disable:no-string-literal  //Reason: spy service config
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].canvas = canvasStub;
        service['shape'] = ellipseSpy;

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

        keyDownEvent = new KeyboardEvent('keydown', { key: 'shift', shiftKey: true });
        keyUpEvent = new KeyboardEvent('keyup', { key: 'shift', shiftKey: false });
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' onKeyDown should set isShiftPressed to true on shift key press', () => {
        service.mouseDown = true;
        service.onKeyDown(keyDownEvent);
        expect(service['isShiftPressed']).toEqual(true);
    });

    it(' onKeyDown should call ellipse.draw on shift key press', () => {
        service.mouseDown = true;

        service.onKeyDown(keyDownEvent);

        expect(ellipseSpy.updateDimensions).toHaveBeenCalled();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(ellipseSpy.draw).toHaveBeenCalled();
        expect(ellipseSpy.drawPerimeter).toHaveBeenCalled();
    });

    it(' onKeyUp should set isShiftPressed to false on shift key release', () => {
        service.onKeyUp(keyUpEvent);
        expect(service['isShiftPressed']).toEqual(false);
    });

    it(' onKeyUp should call ellipse.draw on shift key release', () => {
        service.mouseDown = true;
        service.onKeyUp(keyUpEvent);
        expect(ellipseSpy.updateDimensions).toHaveBeenCalled();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(ellipseSpy.draw).toHaveBeenCalled();
        expect(ellipseSpy.drawPerimeter).toHaveBeenCalled();
    });

    it(' onMouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEventLClick);
        expect(service.mouseDown).toEqual(true);
    });

    it(' onMouseDown should instanciate Tool.shape to Ellipse', () => {
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

    it(' onMouseMove should call ellipse.draw if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onMouseMove(mouseEventLClick);

        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(ellipseSpy.updateDimensions).toHaveBeenCalled();
        expect(ellipseSpy.draw).toHaveBeenCalled();
        expect(ellipseSpy.drawPerimeter).toHaveBeenCalled();
    });

    it(' onMouseMove should not call ellipse.draw if mouse was not already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = false;

        expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
        expect(ellipseSpy.updateDimensions).not.toHaveBeenCalled();
        expect(ellipseSpy.draw).not.toHaveBeenCalled();
        expect(ellipseSpy.drawPerimeter).not.toHaveBeenCalled();
    });
});
