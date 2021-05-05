import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { MouseButton } from '@app/constants/mouse-button';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { StampService } from './stamp.service';

describe('StampService', () => {
    // tslint:disable: no-any
    // tslint:disable:no-string-literal
    // reason: Tests configuration

    let service: StampService;
    let canvasTestHelper: CanvasTestHelper;
    let canvasStub: HTMLCanvasElement;

    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let undoRedoServiceSpy: jasmine.SpyObj<UndoRedoService>;

    let getPositionFromMouseSpy: jasmine.Spy<any>;

    let mouseEventLClick: MouseEvent;
    let mouseEventRClick: MouseEvent;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        undoRedoServiceSpy = jasmine.createSpyObj('UndoRedoService', ['addAction']);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: UndoRedoService, useValue: undoRedoServiceSpy },
            ],
        });

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        canvasStub = canvasTestHelper.canvas;

        service = TestBed.inject(StampService);
        service['drawingService'] = drawServiceSpy;
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].canvas = canvasStub;

        getPositionFromMouseSpy = spyOn<any>(service, 'getPositionFromMouse').and.callThrough();

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

    it('onMouseDown should set mouseDown property to true', () => {
        service.onMouseDown(mouseEventLClick);
        expect(service.mouseDown).toEqual(true);
    });

    it('onMouseUp without prior mouseDown should set mouseDown property to false', () => {
        service.onMouseUp(mouseEventRClick);
        expect(service.mouseDown).toEqual(false);
    });

    it('onMouseUp after mouseDown should call clear canvas', () => {
        service.mouseDown = true;
        service.onMouseUp(mouseEventLClick);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalledWith(previewCtxStub);
        expect(service.mouseDown).toEqual(false);
    });

    it('onMouseUp after onMouseDown should call addAction from undoRedoService', () => {
        service.mouseDown = true;
        service.onMouseUp(mouseEventLClick);
        expect(undoRedoServiceSpy.addAction).toHaveBeenCalled();
        expect(service.mouseDown).toEqual(false);
    });

    it('onMouseMove should call getPositionFromMouse', () => {
        service.onMouseMove(mouseEventLClick);
        expect(getPositionFromMouseSpy).toHaveBeenCalled();
    });
});
