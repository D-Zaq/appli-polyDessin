import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Paintbucket } from '@app/classes/shapes/paintbucket/paintbucket';
import { Vec2 } from '@app/classes/vec2';
import { BLUE_INDEX, MAX_INDEX, MAX_OPACITY, MIN_OPACITY, OFFSETSIZE } from '@app/constants/constants';
import { MouseButton } from '@app/constants/mouse-button';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { PaintbucketService } from './paintbucket.service';

describe('PaintbucketService', () => {
    let service: PaintbucketService;
    let paintbucketSpy: jasmine.SpyObj<Paintbucket>;
    let mouseEventLClick: MouseEvent;
    let mouseEventMiddleClick: MouseEvent;

    let mouseEventRClick: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let canvasStub: HTMLCanvasElement;
    let undoRedoSpy: jasmine.SpyObj<UndoRedoService>;

    // tslint:disable: no-any // reason: Testing spy
    let rightClickSpy: jasmine.Spy<any>;
    let leftClickSpy: jasmine.Spy<any>;

    mouseEventLClick = {
        offsetX: OFFSETSIZE,
        offsetY: OFFSETSIZE,
        x: OFFSETSIZE,
        y: OFFSETSIZE,
        button: MouseButton.Left,
    } as MouseEvent;
    mouseEventMiddleClick = {
        offsetX: OFFSETSIZE,
        offsetY: OFFSETSIZE,
        x: OFFSETSIZE,
        y: OFFSETSIZE,
        button: MouseButton.Middle,
    } as MouseEvent;
    mouseEventRClick = {
        offsetX: OFFSETSIZE,
        offsetY: OFFSETSIZE,
        button: MouseButton.Right,
    } as MouseEvent;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'getPrimaryColor', 'getSecondaryColor']);

        paintbucketSpy = jasmine.createSpyObj('Paintbucket', ['sendVec2Array', 'draw']);
        undoRedoSpy = jasmine.createSpyObj('UndoRedoService', ['addAction']);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: Paintbucket, useValue: paintbucketSpy },
                { provide: UndoRedoService, useValue: undoRedoSpy },
            ],
        });

        canvasTestHelper = TestBed.inject(CanvasTestHelper);

        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        baseCtxStub.beginPath();
        baseCtxStub.rect(0, 0, MIN_OPACITY, MIN_OPACITY);
        baseCtxStub.stroke();
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        service = TestBed.inject(PaintbucketService);
        rightClickSpy = spyOn<any>(service, 'rightClick').and.callThrough();
        leftClickSpy = spyOn<any>(service, 'leftClick').and.callThrough();
        // tslint:disable: no-string-literal // reason: testing purpose
        service['drawingService'] = drawServiceSpy;
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].canvas = canvasStub;

        service['shape'] = paintbucketSpy;
        canvasStub = canvasTestHelper.canvas;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('onMouseDown should clear canvas', () => {
        service.onMouseDown(mouseEventRClick);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    });
    it('onMouseDown should call right click if right click', () => {
        service.onMouseDown(mouseEventRClick);
        expect(rightClickSpy).toHaveBeenCalled();
    });
    it('onMouseDown should call let click if left click', () => {
        service.onMouseDown(mouseEventLClick);
        expect(leftClickSpy).toHaveBeenCalled();
    });
    it('onMouseDown should do nothing if middle click', () => {
        service.onMouseDown(mouseEventMiddleClick);
        expect(leftClickSpy).not.toHaveBeenCalled();
        expect(rightClickSpy).not.toHaveBeenCalled();
    });
    it('rightClick should add action shape to undo', () => {
        service.onMouseDown(mouseEventLClick);
        service.rightClick();
        expect(undoRedoSpy.addAction).toHaveBeenCalled();
    });
    it('leftClick should add action shape to undo', () => {
        service.onMouseDown(mouseEventLClick);
        service.leftClick();
        expect(undoRedoSpy.addAction).toHaveBeenCalled();
    });
    it('compareRGB should return false if black and white and tolerance 99', () => {
        service.onMouseDown(mouseEventLClick);
        service['attributeEditorService'].attributes.tolerance = MAX_OPACITY - 1;
        const blackPixel: number[] = new Array();
        for (let i = 0; i < BLUE_INDEX; i++) {
            blackPixel[i] = 0;
        }
        expect(service.compareRGB(blackPixel)).toBe(false);
    });
    it('compareRGB should return true if black and white and tolerance 100', () => {
        service.onMouseDown(mouseEventLClick);
        service['attributeEditorService'].attributes.tolerance = MAX_OPACITY;
        const blackPixel: number[] = new Array();
        for (let i = 0; i < BLUE_INDEX; i++) {
            blackPixel[i] = 0;
        }
        expect(service.compareRGB(blackPixel)).toBe(true);
    });
    it('pixelIsAlreadyInArray should return true if current pixel is in array', () => {
        const startPixel: Vec2 = { x: 0, y: 0 };
        const comparisonArray = new Array();
        comparisonArray.push(startPixel);
        expect(service.pixelIsAlreadyInArray(startPixel, comparisonArray)).toBe(true);
    });
    it('getRGB should return RGB values', () => {
        service.onMouseDown(mouseEventLClick);
        expect(service.getRGB(0, 0)[0]).toBe(0);
    });
    it('getRGB should return RGB values if not default color', () => {
        baseCtxStub.save();
        baseCtxStub.fillStyle = '#FF0000';
        baseCtxStub.beginPath();
        baseCtxStub.rect(0, 0, MAX_OPACITY, MAX_OPACITY);
        baseCtxStub.stroke();
        baseCtxStub.fill();
        baseCtxStub.restore();

        service['drawingService'].baseCtx = baseCtxStub;
        service.onMouseDown(mouseEventLClick);
        expect(service.getRGB(0, 0)[0]).toBe(MAX_INDEX);
    });

    it('pixelIsAlreadyInArray should return false if current pixel is not array', () => {
        const startPixel: Vec2 = { x: 0, y: 0 };
        const differentPixel: Vec2 = { x: 1, y: 0 };
        const comparisonArray = new Array();
        comparisonArray.push(differentPixel);
        expect(service.pixelIsAlreadyInArray(startPixel, comparisonArray)).toBe(false);
    });
});
