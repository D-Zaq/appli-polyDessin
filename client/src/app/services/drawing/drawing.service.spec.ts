import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { GRID_DEFAULT_SIZE, MINIMUM_HEIGHT, MINIMUM_WIDTH, SIDE_BAR_WIDTH } from '@app/constants/constants';
import { SizeControllerId } from '@app/constants/size-controller-id';
import { DrawingService } from './drawing.service';

// tslint:disable: no-magic-numbers / reason : tests
describe('DrawingService', () => {
    let service: DrawingService;
    let canvasTestHelper: CanvasTestHelper;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DrawingService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        service.canvas = canvasTestHelper.canvas;
        service.baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        service.previewCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        service.gridCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have a default WIDTH and HEIGHT', () => {
        const height = service.canvasSize.y;
        const width = service.canvasSize.x;
        expect(height).toEqual(window.innerHeight / 2);
        expect(width).toEqual((window.innerWidth - SIDE_BAR_WIDTH) / 2);
    });

    it('should clear the whole canvas', () => {
        service.clearCanvas(service.baseCtx);
        const pixelBuffer = new Uint32Array(service.baseCtx.getImageData(0, 0, service.canvas.width, service.canvas.height).data.buffer);
        const hasColoredPixels = pixelBuffer.some((color) => color !== 0);
        expect(hasColoredPixels).toEqual(false);
    });

    it('disablePreviewCanvasResizing should set isResizing to false and set the sizeControllerId to DefaultId', () => {
        service.isResizing = true;
        service.sizeControllerId = SizeControllerId.CenterRightSizeController;
        service.resizingPreviewDashedLine = true;
        service.disablePreviewCanvasResizing();
        expect(service.isResizing).toBeFalse();
        expect(service.sizeControllerId).toEqual(-1);
        expect(service.resizingPreviewDashedLine).toBeFalse();
    });

    it('resizePreviewCanvas should call resizePreviewCanvasWidth and resizePreviewCanvasHeight if resizing is enabled', () => {
        const event = {} as MouseEvent;
        service.isResizing = true;
        const resizePreviewCanvasWidth = spyOn(service, 'resizePreviewCanvasWidth').and.callThrough();
        const resizePreviewCanvasHeight = spyOn(service, 'resizePreviewCanvasHeight').and.callThrough();
        service.resizePreviewCanvas(event);
        expect(resizePreviewCanvasHeight).toHaveBeenCalled();
        expect(resizePreviewCanvasWidth).toHaveBeenCalled();
    });

    it('resizePreviewCanvas should not call resizePreviewCanvasWidth and resizePreviewCanvasHeight if resizing is disabled', () => {
        const event = {} as MouseEvent;
        service.isResizing = false;
        const resizePreviewCanvasWidth = spyOn(service, 'resizePreviewCanvasWidth').and.callThrough();
        const resizePreviewCanvasHeight = spyOn(service, 'resizePreviewCanvasHeight').and.callThrough();
        service.resizePreviewCanvas(event);
        expect(resizePreviewCanvasHeight).toHaveBeenCalledTimes(0);
        expect(resizePreviewCanvasWidth).toHaveBeenCalledTimes(0);
    });

    it('resizePreviewCanvasWidth should do nothing if sizeControllerId is CenterBottomSizeController', () => {
        service.sizeControllerId = SizeControllerId.CenterBottomSizeController;
        service.previewCtx.canvas.width = 0;
        const event = jasmine.createSpyObj('', ['']);
        event.clientX = 300;
        service.resizePreviewCanvasWidth(event);
        expect(service.previewCtx.canvas.width).toEqual(0);
    });

    it('resizePreviewCanvasHeight should do nothing if sizeControllerId is CenterRightSizeController', () => {
        service.sizeControllerId = SizeControllerId.CenterRightSizeController;
        service.previewCtx.canvas.height = 0;
        const event = jasmine.createSpyObj('', ['']);
        event.clientY = 300;
        service.resizePreviewCanvasHeight(event);
        expect(service.previewCtx.canvas.height).toEqual(0);
    });

    it('resizePreviewCanvasWidth should reset width if sizeControllerId is not CenterBottomSizeController', () => {
        service.sizeControllerId = SizeControllerId.CenterRightSizeController;
        service.previewCtx.canvas.width = 0;
        const event = jasmine.createSpyObj('', ['']);
        event.clientX = 300;
        service.resizePreviewCanvasWidth(event);
        expect(service.previewCtx.canvas.width).toEqual(300);
    });

    it('resizePreviewCanvasHeight should reset Height if sizeControllerId is not CenterRightSizeController', () => {
        service.sizeControllerId = SizeControllerId.CenterBottomSizeController;
        service.previewCtx.canvas.height = 0;
        const event = jasmine.createSpyObj('', ['']);
        event.clientY = 300;
        service.resizePreviewCanvasHeight(event);
        expect(service.previewCtx.canvas.height).toEqual(300);
    });

    it('resizePreviewCanvasWidth should reset width to MINIMUM_WIDTH if its less than CANVAS_MIN_WIDTH when sizeControllerId is not CenterBottomSizeController', () => {
        service.sizeControllerId = SizeControllerId.RightBottomSizeController;
        service.previewCtx.canvas.width = 0;
        const event = jasmine.createSpyObj('', ['']);
        event.clientX = 150;
        service.resizePreviewCanvasWidth(event);
        expect(service.previewCtx.canvas.width).toEqual(MINIMUM_WIDTH);
    });

    it('resizePreviewCanvasHeight should reset height to MINIMUM_HEIGHT if its less than CANVAS_MIN_HEIGHT when sizeControllerId is not CenterRightSizeController', () => {
        service.sizeControllerId = SizeControllerId.RightBottomSizeController;
        service.previewCtx.canvas.height = 0;
        const event = jasmine.createSpyObj('', ['']);
        event.clientY = 150;
        service.resizePreviewCanvasHeight(event);
        expect(service.previewCtx.canvas.height).toEqual(MINIMUM_HEIGHT);
    });

    it('updateEntireDrawingSurface should update the baseCtx and the canvas height and width with the new ones', () => {
        const newPreviewHeight = 400;
        const newPreviewWidth = 300;
        service.updateEntireDrawingSurface(newPreviewHeight, newPreviewWidth);
        expect(service.baseCtx.canvas.width).toEqual(newPreviewWidth);
        expect(service.baseCtx.canvas.height).toEqual(newPreviewHeight);
        expect(service.previewCtx.canvas.width).toEqual(newPreviewWidth);
        expect(service.previewCtx.canvas.height).toEqual(newPreviewHeight);
        expect(service.canvas.width).toEqual(newPreviewWidth);
        expect(service.canvas.height).toEqual(newPreviewHeight);
        expect(service.canvasSize.x).toEqual(newPreviewWidth);
        expect(service.canvasSize.y).toEqual(newPreviewHeight);
    });

    it('redrawCanvasImage should call updateEntireDrawingSurface and draw mage', () => {
        const width = 250;
        const height = 250;
        const updateEntireDrawingSurfaceSpy = spyOn(service, 'updateEntireDrawingSurface').and.callThrough();
        service.redrawCanvasImage(height, width);
        expect(updateEntireDrawingSurfaceSpy).toHaveBeenCalledWith(height, width);
        expect(service.canvasSize.x).toEqual(width);
        expect(service.canvasSize.y).toEqual(height);
    });

    it('should return false if the canvas is not empty', () => {
        service.baseCtx.fillRect(5, 5, 10, 10);
        expect(service.isCanvasEmpty(service.baseCtx)).toEqual(false);
    });

    it('should return true when the canvas is empty', () => {
        service.clearCanvas(service.baseCtx);
        expect(service.isCanvasEmpty(service.baseCtx)).toEqual(true);
    });

    it('newCanvasInitialSetSize should update canvas with the correct width and height when working zone width/height is above 500', () => {
        const windowInnerWidth = 781;
        const windowInnerHeight = 501;
        const updateEntireDrawingSurfaceSpy = spyOn(service, 'updateEntireDrawingSurface').and.callThrough();
        service.newCanvasInitialSize(windowInnerWidth, windowInnerHeight);
        expect(updateEntireDrawingSurfaceSpy).toHaveBeenCalledWith(windowInnerHeight / 2, (windowInnerWidth - SIDE_BAR_WIDTH) / 2);
        expect(service.canvasSize.x).toEqual((windowInnerWidth - SIDE_BAR_WIDTH) / 2);
        expect(service.canvasSize.y).toEqual(windowInnerHeight / 2);
    });

    it('newCanvasInitialSetSize should update canvas with the correct width and height when working zone size is below or equal to 500', () => {
        const windowInnerWidth = 779;
        const windowInnerHeight = 449;
        const updateEntireDrawingSurfaceSpy = spyOn(service, 'updateEntireDrawingSurface').and.callThrough();

        service.newCanvasInitialSize(windowInnerWidth, windowInnerHeight);
        expect(updateEntireDrawingSurfaceSpy).toHaveBeenCalledWith(MINIMUM_HEIGHT, MINIMUM_WIDTH);
        expect(service.canvasSize.x).toEqual(MINIMUM_WIDTH);
        expect(service.canvasSize.y).toEqual(MINIMUM_HEIGHT);
    });

    it('drawGrid should call clearCanvas and call drawGridRows and drawGridColumns when isGrid is true', () => {
        service.isGrid = true;
        const clearCanvasSpy = spyOn(service, 'clearCanvas').and.callThrough();
        const drawGridRowsSpy = spyOn(service, 'drawGridRows').and.callThrough();
        const drawGridColumnsSpy = spyOn(service, 'drawGridColumns').and.callThrough();
        service.drawGrid();
        expect(clearCanvasSpy).toHaveBeenCalled();
        expect(drawGridColumnsSpy).toHaveBeenCalled();
        expect(drawGridRowsSpy).toHaveBeenCalled();
    });

    it('drawGrid should call clearCanvas but not call drawGridRows and drawGridColumns when isGrid is false', () => {
        service.isGrid = false;
        const clearCanvasSpy = spyOn(service, 'clearCanvas').and.callThrough();
        const drawGridRowsSpy = spyOn(service, 'drawGridRows').and.callThrough();
        const drawGridColumnsSpy = spyOn(service, 'drawGridColumns').and.callThrough();
        service.drawGrid();
        expect(clearCanvasSpy).toHaveBeenCalled();
        expect(drawGridColumnsSpy).not.toHaveBeenCalled();
        expect(drawGridRowsSpy).not.toHaveBeenCalled();
    });

    it("drawGridRows should call gridCtx's beginPathSpy, moveTo, lineTo and stroke numberOfRows plus one times", () => {
        service.canvas.height = MINIMUM_HEIGHT;
        service.gridSquareSize = GRID_DEFAULT_SIZE;
        const numberOfRows = (service.canvas.height - (service.canvas.height % service.gridSquareSize)) / service.gridSquareSize;
        const beginPathSpy = spyOn(service.gridCtx, 'beginPath').and.callThrough();
        const moveToSpy = spyOn(service.gridCtx, 'moveTo').and.callThrough();
        const lineToSpy = spyOn(service.gridCtx, 'lineTo').and.callThrough();
        const strokeSpy = spyOn(service.gridCtx, 'stroke').and.callThrough();
        service.drawGridRows();
        expect(beginPathSpy).toHaveBeenCalledTimes(numberOfRows + 1);
        expect(moveToSpy).toHaveBeenCalledTimes(numberOfRows + 1);
        expect(lineToSpy).toHaveBeenCalledTimes(numberOfRows + 1);
        expect(strokeSpy).toHaveBeenCalledTimes(numberOfRows + 1);
    });

    it("drawGridColumns should call gridCtx's beginPathSpy, moveTo, lineTo and stroke numberOfColumns plus one times", () => {
        service.canvas.width = MINIMUM_WIDTH;
        service.gridSquareSize = GRID_DEFAULT_SIZE;
        const numberOfColumns = (service.canvas.width - (service.canvas.width % service.gridSquareSize)) / service.gridSquareSize;
        const beginPathSpy = spyOn(service.gridCtx, 'beginPath').and.callThrough();
        const moveToSpy = spyOn(service.gridCtx, 'moveTo').and.callThrough();
        const lineToSpy = spyOn(service.gridCtx, 'lineTo').and.callThrough();
        const strokeSpy = spyOn(service.gridCtx, 'stroke').and.callThrough();
        service.drawGridColumns();
        expect(beginPathSpy).toHaveBeenCalledTimes(numberOfColumns + 1);
        expect(moveToSpy).toHaveBeenCalledTimes(numberOfColumns + 1);
        expect(lineToSpy).toHaveBeenCalledTimes(numberOfColumns + 1);
        expect(strokeSpy).toHaveBeenCalledTimes(numberOfColumns + 1);
    });
});
