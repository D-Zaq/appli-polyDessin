import { TestBed } from '@angular/core/testing';
import { ActionRectangleSelection } from '@app/classes/action-object/action-rectangle-selection/action-rectangle-selection';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Rectangle } from '@app/classes/shapes/rectangle/rectangle';
import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { DrawType } from '@app/constants/draw-type';
import { DrawingService } from '@app/services/drawing/drawing.service';

describe('ActionRectangleSelection', () => {
    // tslint:disable: no-string-literal
    // tslint:disable: no-any
    // tslint:disable: no-magic-numbers
    // reason: Tests (the same reason applies to other tslints in the file)
    let actionRectangleSelection: ActionRectangleSelection;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let canvasStub: HTMLCanvasElement;
    let strokeThickness: number;
    let attributes: ShapeAttribute;
    let primaryColor: string;
    let secondaryColor: string;
    let rectangle: Rectangle;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let image: HTMLImageElement;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'getPrimaryColor', 'getSecondaryColor']);

        TestBed.configureTestingModule({
            providers: [{ provides: 'DrawingService', useValue: drawServiceSpy }],
        });

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        canvasStub = canvasTestHelper.canvas;

        strokeThickness = 0.5;
        attributes = new ShapeAttribute(strokeThickness, DrawType.Outline);
        primaryColor = 'black';
        secondaryColor = 'black';
        const mouseDownCoord = { x: 35, y: 35 };
        drawServiceSpy.baseCtx = baseCtxStub;
        drawServiceSpy.canvas = canvasStub;

        rectangle = new Rectangle(mouseDownCoord, attributes, primaryColor, secondaryColor);
        rectangle.width = 5;
        rectangle.height = 5;
        actionRectangleSelection = new ActionRectangleSelection(rectangle.x, rectangle.y, rectangle.width, rectangle.height);

        image = new Image();
        image.src = drawServiceSpy.canvas.toDataURL();

        actionRectangleSelection.imageMoveSelect = {
            x: 5,
            y: 5,
            width: 5,
            height: 5,
            image,
            isImageFlippedHorizontally: true,
            isImageFlippedVertically: true,
        };
    });

    it('should be created', () => {
        expect(actionRectangleSelection).toBeTruthy();
    });

    it('execute should call ctx.clearRect and ctx.putImageData', () => {
        const drawImagepy = spyOn<any>(drawServiceSpy.baseCtx, 'drawImage').and.callThrough();
        const clearRectSpy = spyOn<any>(drawServiceSpy.baseCtx, 'clearRect').and.callThrough();

        actionRectangleSelection.execute(drawServiceSpy);

        expect(actionRectangleSelection.imageMoveSelect).toBeDefined();
        expect(drawImagepy).toHaveBeenCalled();
        expect(clearRectSpy).toHaveBeenCalled();
    });

    it('execute should not flip imageMoveSelect if isImageFlippedHorizontally and isImageFlippedVertically are both false', () => {
        const drawImageSpy = spyOn<any>(drawServiceSpy.baseCtx, 'drawImage').and.callThrough();

        actionRectangleSelection.imageMoveSelect = {
            x: 10,
            y: 10,
            width: 10,
            height: 10,
            image,
            isImageFlippedHorizontally: false,
            isImageFlippedVertically: false,
        };
        const oldImageMoveSelect = actionRectangleSelection.imageMoveSelect;
        actionRectangleSelection.execute(drawServiceSpy);
        expect(drawImageSpy).toHaveBeenCalledWith(
            oldImageMoveSelect.image,
            oldImageMoveSelect.x,
            oldImageMoveSelect.y,
            oldImageMoveSelect.width,
            oldImageMoveSelect.height,
        );
    });

    it('getImageMoveSelect should return imageMoveSelect property', () => {
        const result = actionRectangleSelection.getImageMoveSelect();
        expect(result).toEqual(actionRectangleSelection.imageMoveSelect);
    });

    it('setImageMoveSelect should set imageMoveSelect property', () => {
        const oldImageMoveSelect = actionRectangleSelection.imageMoveSelect;
        actionRectangleSelection.imageMoveSelect = {
            x: 10,
            y: 10,
            width: 10,
            height: 10,
            image,
            isImageFlippedHorizontally: true,
            isImageFlippedVertically: true,
        };
        expect(actionRectangleSelection.imageMoveSelect).not.toEqual(oldImageMoveSelect);
    });
});
