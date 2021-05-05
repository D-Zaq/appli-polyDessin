import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Rectangle } from '@app/classes/shapes/rectangle/rectangle';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/constants/mouse-button';
import { ColorHistoryService } from '@app/services/color/color-history/color-history.service';
import { ColorPickerService } from '@app/services/color/color-picker/color-picker.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
// import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { PipetteService } from './pipette.service';

describe('PipetteService', () => {
    let service: PipetteService;
    let mouseEventLClick: MouseEvent;
    let mouseEventRClick: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let canvasTestHelper2: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let colorHistoryServiceSpy: jasmine.SpyObj<ColorHistoryService>;
    let colorPickerServiceSpy: jasmine.SpyObj<ColorPickerService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let baseCtxStub2: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let rectangleSpy: jasmine.SpyObj<Rectangle>;
    const MOUSE_POSITION = 1;
    let canvasStub: HTMLCanvasElement;
    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'getPrimaryColor', 'getSecondaryColor']);
        colorPickerServiceSpy = jasmine.createSpyObj('ColorPickerService', ['invertColors', 'addColor']);
        colorHistoryServiceSpy = jasmine.createSpyObj('ColorHistoryService', ['drawColorHistory']);
        rectangleSpy = jasmine.createSpyObj('Rectangle', ['updateDimensions', 'draw']);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: ColorHistoryService, useValue: colorHistoryServiceSpy },
                { provide: ColorPickerService, useValue: colorPickerServiceSpy },
                { provide: Rectangle, useValue: rectangleSpy },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        canvasTestHelper2 = TestBed.inject(CanvasTestHelper);

        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        baseCtxStub2 = canvasTestHelper2.canvas.getContext('2d') as CanvasRenderingContext2D;
        canvasStub = canvasTestHelper.canvas;
        canvasStub.height = 1;
        canvasStub.width = 1;
        service = TestBed.inject(PipetteService);
        service.ctx = baseCtxStub2;
        spyOn(service, 'highlightMiddlePixel');
        spyOn(service, 'getZoomData');
        spyOn(service.ctx, 'createLinearGradient');
        // Configuration du spy du service
        // tslint:disable:no-string-literal / reason : tests
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].canvas = canvasStub;
        service['shape'] = rectangleSpy;

        service.onInit(canvasStub);
        mouseEventLClick = {
            offsetX: MOUSE_POSITION,
            offsetY: MOUSE_POSITION,
        } as MouseEvent;

        mouseEventRClick = {
            offsetX: MOUSE_POSITION,
            offsetY: MOUSE_POSITION,
            button: MouseButton.Right,
        } as MouseEvent;

        service.currentMousePosition.x = 0;
        service.currentMousePosition.y = 0;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it(' onMouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEventLClick);
        expect(service.mouseDown).toEqual(true);
    });
    it(' onMouseDown should set mouseDown property to true on right click', () => {
        service.onMouseDown(mouseEventRClick);
        expect(service.mouseDown).toEqual(true);
    });
    it(' onMouseDown right click should call invert colorPickerService Colors', () => {
        service.onMouseDown(mouseEventRClick);
        expect(colorPickerServiceSpy.invertColors).toHaveBeenCalled();
    });
    it(' onMouseDown left click should get zoom data', () => {
        service.onMouseDown(mouseEventLClick);
        expect(service.getZoomData).toHaveBeenCalled();
    });

    it(' onMouseMove should change this.mouseDownCoord to new mouse position', () => {
        service.onMouseMove(mouseEventLClick);
        expect(service.currentMousePosition.x).toBe(MOUSE_POSITION);
    });
    it(' onMouseMove should get zoom data', () => {
        service.onMouseMove(mouseEventLClick);
        expect(service.getZoomData).toHaveBeenCalled();
    });

    it(' newCanvas should return canvas of proper size', () => {
        const canvasSizeTester: Vec2 = { x: 250, y: 250 };
        drawServiceSpy.canvasSize = canvasSizeTester;

        expect(service.newCanvas()).toBeInstanceOf(HTMLCanvasElement);
        expect(service.newCanvas().width).toBe(service.PIXELS_ZOOM);
        expect(service.newCanvas().height).toBe(service.PIXELS_ZOOM);
    });
    it(' getData should return propet ImageData', () => {
        const canvasSizeTester: Vec2 = { x: 250, y: 250 };
        drawServiceSpy.canvasSize = canvasSizeTester;

        service.getData();
        expect(service.getData()).toBeInstanceOf(ImageData);
        expect(service.getData().width).toBe(service.PIXELS_ZOOM);
        expect(service.getData().height).toBe(service.PIXELS_ZOOM);
    });
    it(' rgbToHex throws error if value above MAX_INTEGER', () => {
        const overflowInteger = 300;
        expect(() => {
            service.rgbToHex(overflowInteger, overflowInteger, overflowInteger);
        }).toThrow(new Error('Invalid color component'));
    });
    it(' rgbToHex should return appropriate string', () => {
        const MAX_INTEGER = 255;
        expect(service.rgbToHex(MAX_INTEGER, MAX_INTEGER, MAX_INTEGER)).toBe('ffffff');
    });
    it(' onMouseUp should clearRect if mouse down is false', () => {
        spyOn(service.ctx, 'clearRect');
        service.mouseDown = false;
        service.onMouseUp(mouseEventLClick);
        expect(service.ctx.clearRect).toHaveBeenCalled();
    });
    it(' onMouseUp should make mouseDOwn false', () => {
        service.mouseDown = true;
        service.onMouseUp(mouseEventLClick);
        expect(service.mouseDown).toBe(false);
    });
    it(' onInit should change ctx', () => {
        expect(service.ctx).toBeDefined();
    });
});
