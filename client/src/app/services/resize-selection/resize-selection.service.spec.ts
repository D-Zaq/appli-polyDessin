import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { BoundingBox } from '@app/classes/selections/bounding-box/bounding-box';
import { RectangleSelection } from '@app/classes/selections/rectangle-selection/rectangle-selection';
import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { DrawType } from '@app/constants/draw-type';
import { Handle } from '@app/constants/handle';
import { MouseButton } from '@app/constants/mouse-button';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ResizeSelectionService } from './resize-selection.service';

describe('ResizeSelectionService', () => {
    // tslint:disable: no-string-literal
    // tslint:disable: no-any
    // tslint:disable: no-magic-numbers
    // reason: Tests (the same reason applies to other tslints in the file)
    let service: ResizeSelectionService;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let canvasStub: HTMLCanvasElement;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let selectionSpy: jasmine.SpyObj<RectangleSelection>;
    let getPositionFromMouseSpy: jasmine.Spy<any>;
    let mouseEventLClick: MouseEvent;
    let strokeThickness: number;
    let attributes: ShapeAttribute;
    let primaryColor: string;
    let secondaryColor: string;
    let keyUpEvent: KeyboardEvent;
    let keyDownEvent: KeyboardEvent;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'getPrimaryColor', 'getSecondaryColor']);
        selectionSpy = jasmine.createSpyObj('RectangleSelection', [
            'updateDimensions',
            'setLineDash',
            'resetLineDash',
            'draw',
            'contains',
            'updateDimensionsMove',
            'saveSelectedPixels',
            'createActionObject',
        ]);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: RectangleSelection, useValue: selectionSpy },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        canvasStub = canvasTestHelper.canvas;

        service = TestBed.inject(ResizeSelectionService);
        getPositionFromMouseSpy = spyOn<any>(service, 'getPositionFromMouse').and.callThrough();
        service['drawingService'] = drawServiceSpy;
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].canvas = canvasStub;

        mouseEventLClick = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;

        strokeThickness = 0.5;
        attributes = new ShapeAttribute(strokeThickness, DrawType.Outline);
        primaryColor = 'black';
        secondaryColor = 'black';
        const mousePosition = { x: 0, y: 0 };
        const rectangleSelection = new RectangleSelection(mousePosition, attributes, primaryColor, secondaryColor);
        rectangleSelection.boundingBox = new BoundingBox(mousePosition, attributes, primaryColor, secondaryColor);
        rectangleSelection.boundingBox.createControlPoints();
        const controlPoint = rectangleSelection.boundingBox.controlPoints[0];
        service.onInit(rectangleSelection, controlPoint);
        service['selection'] = selectionSpy;
        service['selection'].boundingBox = new BoundingBox(mousePosition, attributes, primaryColor, secondaryColor);
        service['selection'].boundingBox.rectangle.width = 5;
        service['selection'].boundingBox.rectangle.height = 5;
        service['selection'].boundingBox.rectangle.x = 10;
        service['selection'].boundingBox.rectangle.y = 10;
        keyDownEvent = new KeyboardEvent('keydown', { key: 'shift' });
        keyUpEvent = new KeyboardEvent('keyup', { key: 'shift' });
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('onInit should set the selection property', () => {
        const mousePosition = { x: 0, y: 0 };
        const rectangleSelection = new RectangleSelection(mousePosition, attributes, primaryColor, secondaryColor);
        rectangleSelection.boundingBox = new BoundingBox(mousePosition, attributes, primaryColor, secondaryColor);
        rectangleSelection.boundingBox.createControlPoints();
        const controlPoint = rectangleSelection.boundingBox.controlPoints[0];
        service.onInit(rectangleSelection, controlPoint);
        expect(service['isResizing']).toBe(true);
        expect(service['currentMousePosition']).toEqual({ x: 0, y: 0 });
        expect(service['controlPoint']).toEqual(controlPoint);
        expect(service['isShiftPressed']).toBe(false);
        expect(service.selection).toEqual(rectangleSelection);
    });

    it('onKeyDown should set isShiftPressed to true ', () => {
        service.onKeyDown(keyDownEvent);
        expect(service['isShiftPressed']).toBe(true);
    });

    it('onKeyUp should set isShiftPressed to false ', () => {
        service.onKeyUp(keyUpEvent);
        expect(service['isShiftPressed']).toBe(false);
    });

    it('onMouseDown should set the currentMousePosition', () => {
        service.onMouseDown(mouseEventLClick);
        expect(getPositionFromMouseSpy).toHaveBeenCalled();
        expect(service['currentMousePosition']).toEqual({ x: 25, y: 25 });
        expect(service['isResizing']).toBe(true);
    });

    it('onMouseUp should clear canvas, reset linedash and draw selection', () => {
        service.onMouseUp(mouseEventLClick);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalledWith(previewCtxStub);
        expect(selectionSpy.resetLineDash).toHaveBeenCalledWith(previewCtxStub);
        expect(selectionSpy.draw).toHaveBeenCalledWith(previewCtxStub);
    });

    it('onMouseMove should call getPositionFromMouse, clearCanvas, updateControlPoints, setLineDash,draw', () => {
        service.onMouseMove(mouseEventLClick);
        expect(getPositionFromMouseSpy).toHaveBeenCalled();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalledWith(previewCtxStub);
        expect(selectionSpy.setLineDash).toHaveBeenCalledWith(previewCtxStub);
        expect(selectionSpy.draw).toHaveBeenCalledWith(previewCtxStub);
    });

    it('onMouseMove should modify x/y/width/height if controlPoint is top left', () => {
        service['controlPoint'] = { x: 5, y: 5, sideLength: 5, handle: Handle.TopLeft };
        service.onMouseMove(mouseEventLClick);
        expect(service['selection'].boundingBox.rectangle.width).toEqual(-10);
        expect(service['selection'].boundingBox.rectangle.height).toEqual(-10);
        expect(service['selection'].boundingBox.rectangle.x).toEqual(25);
        expect(service['selection'].boundingBox.rectangle.y).toEqual(25);
    });

    it('onMouseMove should modify dimensions while keeping ratio if controlPoint is top left and isShiftPressed is true', () => {
        service['isShiftPressed'] = true;
        service['controlPoint'] = { x: 5, y: 5, sideLength: 5, handle: Handle.TopLeft };
        const keepAspectRatioTopLeftSpy = spyOn<any>(service, 'keepAspectRatioTopLeft').and.callThrough();

        service.onMouseMove(mouseEventLClick);

        expect(keepAspectRatioTopLeftSpy);
        expect(service['selection'].boundingBox.rectangle.width).toEqual(1);
        expect(service['selection'].boundingBox.rectangle.height).toEqual(1);
        expect(service['selection'].boundingBox.rectangle.x).toEqual(14);
        expect(service['selection'].boundingBox.rectangle.y).toEqual(14);
    });

    it('onMouseMove should modify width/height/y if controlPoint is top right', () => {
        service['controlPoint'] = { x: 5, y: 5, sideLength: 5, handle: Handle.TopRight };
        service.onMouseMove(mouseEventLClick);

        expect(service['selection'].boundingBox.rectangle.width).toEqual(15);
        expect(service['selection'].boundingBox.rectangle.height).toEqual(-10);
        expect(service['selection'].boundingBox.rectangle.y).toEqual(25);
    });

    it('onMouseMove should modify dimensions while keeping ratio if controlPoint is top right and isShiftPressed is true', () => {
        service['isShiftPressed'] = true;
        service['controlPoint'] = { x: 5, y: 5, sideLength: 5, handle: Handle.TopRight };
        const keepAspectRatioTopRightSpy = spyOn<any>(service, 'keepAspectRatioTopRight').and.callThrough();

        service.onMouseMove(mouseEventLClick);

        expect(keepAspectRatioTopRightSpy);
        expect(service['selection'].boundingBox.rectangle.width).toEqual(10.630145812734648);
        expect(service['selection'].boundingBox.rectangle.height).toEqual(10.630145812734648);
        expect(service['selection'].boundingBox.rectangle.x).toEqual(10);
        expect(service['selection'].boundingBox.rectangle.y).toEqual(4.369854187265352);
    });

    it('onMouseMove should modify width/height/x if controlPoint is bottom left', () => {
        service['controlPoint'] = { x: 5, y: 5, sideLength: 5, handle: Handle.BottomLeft };
        service.onMouseMove(mouseEventLClick);

        expect(service['selection'].boundingBox.rectangle.width).toEqual(-10);
        expect(service['selection'].boundingBox.rectangle.height).toEqual(15);
        expect(service['selection'].boundingBox.rectangle.x).toEqual(25);
    });

    it('onMouseMove should modify dimensions while keeping ratio if controlPoint is bottom left and isShiftPressed is true', () => {
        service['isShiftPressed'] = true;
        service['controlPoint'] = { x: 5, y: 5, sideLength: 5, handle: Handle.BottomLeft };
        const keepAspectRatioBottomLeftSpy = spyOn<any>(service, 'keepAspectRatioBottomLeft').and.callThrough();
        service.onMouseMove(mouseEventLClick);

        expect(keepAspectRatioBottomLeftSpy);
        expect(service['selection'].boundingBox.rectangle.width).toEqual(10.630145812734648);
        expect(service['selection'].boundingBox.rectangle.height).toEqual(10.630145812734648);
        expect(service['selection'].boundingBox.rectangle.x).toEqual(4.369854187265352);
        expect(service['selection'].boundingBox.rectangle.y).toEqual(10);
    });

    it('onMouseMove should modify width/height if controlPoint is bottom right', () => {
        service['controlPoint'] = { x: 5, y: 5, sideLength: 5, handle: Handle.BottomRight };
        service.onMouseMove(mouseEventLClick);

        expect(service['selection'].boundingBox.rectangle.width).toEqual(15);
        expect(service['selection'].boundingBox.rectangle.height).toEqual(15);
    });

    it('onMouseMove should modify dimensions while keeping ratio if controlPoint is bottom right and isShiftPressed is true', () => {
        service['isShiftPressed'] = true;
        service['controlPoint'] = { x: 5, y: 5, sideLength: 5, handle: Handle.BottomRight };
        const keepAspectRatioBottomRightSpy = spyOn<any>(service, 'keepAspectRatioBottomRight').and.callThrough();

        service.onMouseMove(mouseEventLClick);

        expect(keepAspectRatioBottomRightSpy);
        expect(service['selection'].boundingBox.rectangle.width).toEqual(15);
        expect(service['selection'].boundingBox.rectangle.height).toEqual(15);
        expect(service['selection'].boundingBox.rectangle.x).toEqual(10);
        expect(service['selection'].boundingBox.rectangle.y).toEqual(10);
    });

    it('onMouseMove should modify y/height if controlPoint is top', () => {
        service['controlPoint'] = { x: 5, y: 5, sideLength: 5, handle: Handle.Top };
        service.onMouseMove(mouseEventLClick);
        expect(service['selection'].boundingBox.rectangle.height).toEqual(-10);
        expect(service['selection'].boundingBox.rectangle.y).toEqual(25);
    });

    it('onMouseMove should only modify height if controlPoint is top and selection.isImageFlippedVertically is true', () => {
        service['controlPoint'] = { x: 5, y: 5, sideLength: 5, handle: Handle.Top };
        service['selection'].isImageFlippedVertically = true;
        service.onMouseMove(mouseEventLClick);

        expect(service['selection'].boundingBox.rectangle.height).toEqual(15);
        expect(service['selection'].boundingBox.rectangle.y).toEqual(10);
    });

    it('onMouseMove should modify x/width if controlPoint is left', () => {
        service['controlPoint'] = { x: 5, y: 5, sideLength: 5, handle: Handle.Left };
        service.onMouseMove(mouseEventLClick);

        expect(service['selection'].boundingBox.rectangle.width).toEqual(-10);
        expect(service['selection'].boundingBox.rectangle.x).toEqual(25);
    });

    it('onMouseMove should only modify width if controlPoint is left and selection.isImageFlippedHorizontally is true', () => {
        service['controlPoint'] = { x: 5, y: 5, sideLength: 5, handle: Handle.Left };
        service['selection'].isImageFlippedHorizontally = true;
        service.onMouseMove(mouseEventLClick);

        expect(service['selection'].boundingBox.rectangle.width).toEqual(15);
        expect(service['selection'].boundingBox.rectangle.x).toEqual(10);
    });

    it('onMouseMove should modify height if controlPoint is bottom', () => {
        service['controlPoint'] = { x: 5, y: 5, sideLength: 5, handle: Handle.Bottom };
        service.onMouseMove(mouseEventLClick);

        expect(service['selection'].boundingBox.rectangle.height).toEqual(15);
    });

    it('onMouseMove should modify height/y if controlPoint is bottom and selection.isImageFlippedVertically is true', () => {
        service['controlPoint'] = { x: 5, y: 5, sideLength: 5, handle: Handle.Bottom };
        service['selection'].isImageFlippedVertically = true;
        service.onMouseMove(mouseEventLClick);

        expect(service['selection'].boundingBox.rectangle.height).toEqual(-10);
        expect(service['selection'].boundingBox.rectangle.y).toEqual(25);
    });

    it('onMouseMove should modify width if controlPoint is right', () => {
        service['controlPoint'] = { x: 5, y: 5, sideLength: 5, handle: Handle.Right };
        service.onMouseMove(mouseEventLClick);
        expect(service['selection'].boundingBox.rectangle.width).toEqual(15);
    });

    it('onMouseMove should modify width/x if controlPoint is right and selection.isImageFlippedHorizontally is true', () => {
        service['controlPoint'] = { x: 5, y: 5, sideLength: 5, handle: Handle.Right };
        service['selection'].isImageFlippedHorizontally = true;
        service.onMouseMove(mouseEventLClick);
        expect(service['selection'].boundingBox.rectangle.width).toEqual(-10);
        expect(service['selection'].boundingBox.rectangle.x).toEqual(25);
    });

    it('updateLimitedMousePos should properly modify limitedMousePos.x/y if top left', () => {
        const posToCheck = { x: 3, y: 3 };
        service['oppositeCornerPos'] = { x: 5, y: 5 };
        service.updateLimitedMousePos(posToCheck, 'left', 'top');
        expect(service['limitedMousePos'].x).toEqual(3);
        expect(service['limitedMousePos'].y).toEqual(3);
    });

    it('updateLimitedMousePos should properly modify limitedMousePos.x/y if bottom right', () => {
        const posToCheck = { x: 3, y: 3 };
        service['oppositeCornerPos'] = { x: 5, y: 5 };
        service.updateLimitedMousePos(posToCheck, 'right', 'bottom');
        expect(service['limitedMousePos'].x).toEqual(6);
        expect(service['limitedMousePos'].y).toEqual(6);
    });
});
