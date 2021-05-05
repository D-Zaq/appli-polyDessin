import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Rectangle } from '@app/classes/shapes/rectangle/rectangle';
import { MouseButton } from '@app/constants/mouse-button';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { RectangleService } from './rectangle.service';

describe('RectangleService', () => {
    // tslint:disable: no-any
    // tslint:disable:no-string-literal
    // reason: Tests configuration

    let service: RectangleService;
    let mouseEventLClick: MouseEvent;
    let mouseEventRClick: MouseEvent;
    let keyUpEvent: KeyboardEvent;
    let keyDownEvent: KeyboardEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let rectangleSpy: jasmine.SpyObj<Rectangle>;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let canvasStub: HTMLCanvasElement;
    let createRectangleSpy: jasmine.Spy<any>;
    let undoRedoSpy: jasmine.SpyObj<UndoRedoService>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'getPrimaryColor', 'getSecondaryColor']);
        rectangleSpy = jasmine.createSpyObj('Rectangle', ['updateDimensions', 'draw']);
        undoRedoSpy = jasmine.createSpyObj('UndoRedoService', ['addAction']);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: Rectangle, useValue: rectangleSpy },
                { provide: UndoRedoService, useValue: undoRedoSpy },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        canvasStub = canvasTestHelper.canvas;

        service = TestBed.inject(RectangleService);
        createRectangleSpy = spyOn<any>(service, 'createRectangle').and.callThrough();

        service['drawingService'] = drawServiceSpy;
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].canvas = canvasStub;
        service['shape'] = rectangleSpy;

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

    it(' onKeyDown should call createRectangle on shift key press', () => {
        service.mouseDown = true;
        service.onKeyDown(keyDownEvent);

        expect(createRectangleSpy).toHaveBeenCalled();
    });

    it(' onKeyUp should set isShiftPressed to false on shift key release', () => {
        service.mouseDown = true;
        service.onKeyUp(keyUpEvent);
        expect(service['isShiftPressed']).toEqual(false);
    });

    it(' onKeyUp should call createRectangle on shift key release', () => {
        service.mouseDown = true;
        service.onKeyUp(keyUpEvent);
        expect(createRectangleSpy).toHaveBeenCalled();
    });

    it(' onMouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEventLClick);
        expect(service.mouseDown).toEqual(true);
    });

    it(' onMouseDown should set mouseDown property to false on right click', () => {
        service.onMouseDown(mouseEventRClick);
        expect(service.mouseDown).toEqual(false);
    });

    it(' onMouseDown should instanciate Tool.shape to Rectangle', () => {
        service.onMouseDown(mouseEventLClick);
        expect(service.shape).not.toBeNull();
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

    it(' onMouseMove should call createRectangle if mouse was already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = true;

        service.onMouseMove(mouseEventLClick);
        expect(createRectangleSpy).toHaveBeenCalled();
    });

    it(' onMouseMove should not call createRectangle if mouse was not already down', () => {
        service.mouseDownCoord = { x: 0, y: 0 };
        service.mouseDown = false;

        service.onMouseMove(mouseEventLClick);
        expect(createRectangleSpy).not.toHaveBeenCalled();
    });

    it(' createRectangle should call rectangle.draw ', () => {
        service.mouseDown = true;
        service.createRectangle();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
        expect(rectangleSpy.updateDimensions).toHaveBeenCalled();
        expect(rectangleSpy.draw).toHaveBeenCalled();
    });
});
