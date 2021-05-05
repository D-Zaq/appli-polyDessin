import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Ellipse } from '@app/classes/shapes/ellipse/ellipse';
import { Rectangle } from '@app/classes/shapes/rectangle/rectangle';
import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { Vec2 } from '@app/classes/vec2';
import { DrawType } from '@app/constants/draw-type';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ActionEllipseSelection } from './action-ellipse-selection';

describe('ActionEllipseSelection', () => {
    // tslint:disable: no-string-literal
    // tslint:disable: no-any
    // tslint:disable: no-magic-numbers
    // reason: Tests (the same reason applies to other tslints in the file)
    let actionEllipseSelection: ActionEllipseSelection;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let canvasStub: HTMLCanvasElement;
    let strokeThickness: number;
    let attributes: ShapeAttribute;
    let primaryColor: string;
    let secondaryColor: string;
    let ellipse: Ellipse;
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

        ellipse = new Ellipse(mouseDownCoord, attributes, primaryColor, secondaryColor);
        rectangle = new Rectangle(mouseDownCoord, attributes, primaryColor, secondaryColor);
        const rectangleX = rectangle.x;
        const rectangleY = rectangle.y;
        const rectangleWidth = rectangle.width;
        const rectangleHeight = rectangle.height;

        actionEllipseSelection = new ActionEllipseSelection(ellipse, rectangleX, rectangleY, rectangleWidth, rectangleHeight);

        image = new Image();
        image.src = drawServiceSpy.canvas.toDataURL();

        actionEllipseSelection.imageMoveSelect = {
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
        expect(actionEllipseSelection).toBeTruthy();
    });

    it('execute should put clearImage and moveSelectImage.imageData', () => {
        const isShiftPressed = false;
        const mousePosition = { x: 40, y: 40 };
        actionEllipseSelection.ellipse.updateDimensions(mousePosition, isShiftPressed);
        actionEllipseSelection.rectangleX = actionEllipseSelection.ellipse.x - actionEllipseSelection.ellipse.radiusX;
        actionEllipseSelection.rectangleY = actionEllipseSelection.ellipse.y - actionEllipseSelection.ellipse.radiusY;
        actionEllipseSelection.rectangleWidth = actionEllipseSelection.ellipse.radiusX * 2;
        actionEllipseSelection.rectangleHeight = actionEllipseSelection.ellipse.radiusY * 2;

        const putImageDataSpy = spyOn<any>(drawServiceSpy.baseCtx, 'putImageData').and.callThrough();
        const getImageDataSpy = spyOn<any>(drawServiceSpy.baseCtx, 'getImageData').and.callThrough();

        actionEllipseSelection.execute(drawServiceSpy);

        const width = actionEllipseSelection.rectangleWidth;
        const height = actionEllipseSelection.rectangleHeight;
        const xPos = actionEllipseSelection.rectangleX;
        const yPos = actionEllipseSelection.rectangleY;
        const startRow = yPos;
        const limitRow = yPos + height;
        const startCol = xPos;
        const limitCol = xPos + width;
        let pixelCounter = 0;
        let positionPixel: Vec2;
        const indexRed = 0;
        const indexGreen = 1;
        const indexBlue = 2;
        const indexAlpha = 3;
        const iterationNumber = 4;
        const maxValue = 255;

        for (let i = startRow; i < limitRow; i++) {
            for (let j = startCol; j < limitCol; j++) {
                positionPixel = { x: j, y: i };
                if (actionEllipseSelection.ellipse.contains(positionPixel)) {
                    expect(actionEllipseSelection.clearImage.data[pixelCounter + indexRed]).toEqual(maxValue);
                    expect(actionEllipseSelection.clearImage.data[pixelCounter + indexGreen]).toEqual(maxValue);
                    expect(actionEllipseSelection.clearImage.data[pixelCounter + indexBlue]).toEqual(maxValue);
                    expect(actionEllipseSelection.clearImage.data[pixelCounter + indexAlpha]).toEqual(maxValue);
                }
                pixelCounter += iterationNumber;
            }
        }
        expect(actionEllipseSelection.clearImage).toBeDefined();
        expect(getImageDataSpy).toHaveBeenCalled();
        expect(putImageDataSpy).toHaveBeenCalled();
    });

    it('execute should not flip imageMoveSelect if isImageFlippedHorizontally and isImageFlippedVertically are both false', () => {
        const isShiftPressed = false;
        const mousePosition = { x: 40, y: 40 };
        actionEllipseSelection.ellipse.updateDimensions(mousePosition, isShiftPressed);
        actionEllipseSelection.rectangleX = actionEllipseSelection.ellipse.x - actionEllipseSelection.ellipse.radiusX;
        actionEllipseSelection.rectangleY = actionEllipseSelection.ellipse.y - actionEllipseSelection.ellipse.radiusY;
        actionEllipseSelection.rectangleWidth = actionEllipseSelection.ellipse.radiusX * 2;
        actionEllipseSelection.rectangleHeight = actionEllipseSelection.ellipse.radiusY * 2;
        actionEllipseSelection.imageMoveSelect = {
            x: 10,
            y: 10,
            width: 10,
            height: 10,
            image,
            isImageFlippedHorizontally: false,
            isImageFlippedVertically: false,
        };
        const oldImageMoveSelect = actionEllipseSelection.imageMoveSelect;
        const drawImageSpy = spyOn<any>(drawServiceSpy.baseCtx, 'drawImage').and.callThrough();

        actionEllipseSelection.execute(drawServiceSpy);
        expect(drawImageSpy).toHaveBeenCalledWith(
            oldImageMoveSelect.image,
            oldImageMoveSelect.x,
            oldImageMoveSelect.y,
            oldImageMoveSelect.width,
            oldImageMoveSelect.height,
        );
    });

    it('getImageMoveSelect should return imageMoveSelect property', () => {
        const result = actionEllipseSelection.getImageMoveSelect();
        expect(result).toEqual(actionEllipseSelection.imageMoveSelect);
    });

    it('setImageMoveSelect should set imageMoveSelect property', () => {
        const oldImageMoveSelect = actionEllipseSelection.imageMoveSelect;
        actionEllipseSelection.imageMoveSelect = {
            x: 10,
            y: 10,
            width: 10,
            height: 10,
            image,
            isImageFlippedHorizontally: true,
            isImageFlippedVertically: true,
        };
        expect(actionEllipseSelection.imageMoveSelect).not.toEqual(oldImageMoveSelect);
    });
});
