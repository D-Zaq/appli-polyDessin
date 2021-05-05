import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { BoundingBox } from '@app/classes/selections/bounding-box/bounding-box';
import { RectangleSelection } from '@app/classes/selections/rectangle-selection/rectangle-selection';
import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { DrawType } from '@app/constants/draw-type';
import { MouseButton } from '@app/constants/mouse-button';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MagnetismService } from '@app/services/magnetism/magnetism.service';
import { MoveSelectionService } from './move-selection.service';

describe('MoveSelectionService', () => {
    // tslint:disable: no-string-literal
    // tslint:disable: no-any
    // tslint:disable: no-magic-numbers
    // reason: Tests (the same reason applies to other tslints in the file)
    let service: MoveSelectionService;
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
    let moveSelectionWithArrowsSpy: jasmine.Spy<any>;
    let keyUpEvent: KeyboardEvent;
    let timerCallback: jasmine.Spy<any>;
    let drawMovingSelectionSpy: jasmine.Spy<any>;
    let isSelectionOutsideCanvasSpy: jasmine.Spy<any>;
    let magnetismServiceSpy: jasmine.SpyObj<MagnetismService>;

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

        magnetismServiceSpy = jasmine.createSpyObj('MagnetismService', ['isMagnetismToggled', 'setSnapPosition', 'snapSelectionToGrid']);
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

        service = TestBed.inject(MoveSelectionService);
        getPositionFromMouseSpy = spyOn<any>(service, 'getPositionFromMouse').and.callThrough();
        moveSelectionWithArrowsSpy = spyOn<any>(service, 'moveSelectionWithArrows').and.callThrough();
        drawMovingSelectionSpy = spyOn<any>(service, 'drawMovingSelection').and.callThrough();
        isSelectionOutsideCanvasSpy = spyOn<any>(service, 'isSelectionOutsideCanvas').and.callThrough();
        service['drawingService'] = drawServiceSpy;
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].canvas = canvasStub;

        service['magnetismService'] = magnetismServiceSpy;
        service['magnetismService'].isMagnetismToggled = false;

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
        service.onInit(rectangleSelection);
        service['selection'] = selectionSpy;
        service['selection'].boundingBox = new BoundingBox(mousePosition, attributes, primaryColor, secondaryColor);

        keyUpEvent = new KeyboardEvent('keyup', { key: 'ArrowLeft' });

        timerCallback = jasmine.createSpy('timerCallback');
        jasmine.clock().uninstall();
        jasmine.clock().install();
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('onInit should set the selection property', () => {
        const mousePosition = { x: 0, y: 0 };
        service['magnetismService'].isMagnetismToggled = true;
        const rectangleSelection = new RectangleSelection(mousePosition, attributes, primaryColor, secondaryColor);
        service.onInit(rectangleSelection);
        expect(service['currentMousePosition']).toEqual({ x: 0, y: 0 });
        expect(service['previousMousePosition']).toEqual(service['currentMousePosition']);
        expect(service['keys']).toBeDefined();
        expect(magnetismServiceSpy.setSnapPosition).toHaveBeenCalled();
        expect(service.selection).toEqual(rectangleSelection);
    });

    it('onKeyDown should modify the value of ArrowLeft key of keys map if event.key is ArrowLeft', () => {
        const keyDownEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        service.onKeyDown(keyDownEvent);
        expect(service['keys'].get(keyDownEvent.key)).toBe(true);
    });

    it('onKeyDown should modify the value of ArrowRight key of keys map if event.key is ArrowRight', () => {
        const keyDownEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        service.onKeyDown(keyDownEvent);
        expect(service['keys'].get(keyDownEvent.key)).toBe(true);
    });

    it('onKeyDown should modify the value of ArrowUp key of keys map if event.key is ArrowUp', () => {
        const keyDownEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        service.onKeyDown(keyDownEvent);
        expect(service['keys'].get(keyDownEvent.key)).toBe(true);
    });

    it('onKeyDown should modify the value of ArrowDown key of keys map if event.key is ArrowDown', () => {
        const keyDownEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        service.onKeyDown(keyDownEvent);
        expect(service['keys'].get(keyDownEvent.key)).toBe(true);
    });

    it('onKeyDown causes a timeout of 500 ms to be called if isHandlersStarted is false', () => {
        const keyDownEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        service.onKeyDown(keyDownEvent);
        setTimeout(() => {
            timerCallback();
        }, 500);

        expect(timerCallback).not.toHaveBeenCalled();

        jasmine.clock().tick(1000);
        expect(timerCallback).toHaveBeenCalled();
        expect(service['isHandlersStarted']).toBe(true);
        expect(service['keyDownTime']).toBeDefined();
        expect(moveSelectionWithArrowsSpy).toHaveBeenCalled();
    });

    it('onKeyUp should should call moveSelectionWithArrows if the difference between keyDownTime and keyUpTime is less than 500 ms', () => {
        const keyDownEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        service.onKeyDown(keyDownEvent);
        service.onKeyUp(keyUpEvent);
        expect(service['keyUpTime']).toBeDefined();
        expect(moveSelectionWithArrowsSpy).toHaveBeenCalled();
    });

    it('onKeyUp should should call window.clearInterval if the value of each key of the keys map is false', () => {
        const keyDownEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        keyUpEvent = new KeyboardEvent('keyup', { key: 'ArrowDown' });
        service.onKeyDown(keyDownEvent);
        const clearIntervalSpy = spyOn(window, 'clearInterval');
        service.onKeyUp(keyUpEvent);
        expect(clearIntervalSpy).toHaveBeenCalledWith(service.handleTimeout);
        expect(clearIntervalSpy).toHaveBeenCalledWith(service.handleInterval);
    });

    it('onMouseDown should set the currentMousePosition and previousMousePosition properties', () => {
        service.onMouseDown(mouseEventLClick);
        expect(getPositionFromMouseSpy).toHaveBeenCalled();
        expect(service['currentMousePosition']).toEqual({ x: 25, y: 25 });
        expect(service['previousMousePosition']).toEqual(service['currentMousePosition']);
    });

    it('onMouseMove should call drawMovingSelection', () => {
        service.onMouseMove(mouseEventLClick);
        expect(drawMovingSelectionSpy).toHaveBeenCalled();
        expect(getPositionFromMouseSpy).toHaveBeenCalled();
        expect(service['currentMousePosition']).toEqual(service['currentMousePosition']);
    });

    it('onMouseMove should call magnetismSelection.snapSelectioToGrid if magnetismSelection.isMagnetismToggled is true', () => {
        service['magnetismService'].isMagnetismToggled = true;
        service.onMouseMove(mouseEventLClick);
        expect(magnetismServiceSpy.snapSelectionToGrid).toHaveBeenCalled();
    });

    it('moveSelectionWithArrows should call drawMovingSelection', () => {
        service['keys'].set('ArrowLeft', true);
        service['keys'].set('ArrowRight', true);
        service['keys'].set('ArrowUp', true);
        service['keys'].set('ArrowDown', true);
        service.moveSelectionWithArrows();
        expect(drawMovingSelectionSpy).toHaveBeenCalled();
    });

    it('moveSelectionWithArrows should call magnetismSelection.snapSelectioToGrid if magnetismSelection.isMagnetismToggled is true', () => {
        service['keys'].set('ArrowLeft', true);
        service['keys'].set('ArrowRight', true);
        service['keys'].set('ArrowUp', true);
        service['keys'].set('ArrowDown', true);
        service['magnetismService'].isMagnetismToggled = true;
        service.moveSelectionWithArrows();
        expect(magnetismServiceSpy.snapSelectionToGrid).toHaveBeenCalled();
    });

    it('drawMovingSelection should call isSelectionOutsideCanvas, clearCanvas, updateDimensionsMove and draw', () => {
        service['keys'].set('ArrowLeft', true);
        service.drawMovingSelection(0, 0);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalledWith(previewCtxStub);
        expect(selectionSpy.updateDimensionsMove).toHaveBeenCalled();
        expect(selectionSpy.draw).toHaveBeenCalled();
        expect(isSelectionOutsideCanvasSpy).toHaveBeenCalled();
    });
});
