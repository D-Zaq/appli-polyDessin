import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { LassoPolygonalSelection } from '@app/classes/selections/lasso-polygonal-selection/lasso-polygonal-selection';
import { Rectangle } from '@app/classes/shapes/rectangle/rectangle';
import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { Vec2 } from '@app/classes/vec2';
import { DrawType } from '@app/constants/draw-type';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ActionLassoSelection } from './action-lasso-polygonal-selection';

describe('ActionLassoSelection', () => {
    // tslint:disable: no-string-literal
    // tslint:disable: no-any
    // tslint:disable: no-magic-numbers
    // reason: Tests (the same reason applies to other tslints in the file)
    let actionLassoSelection: ActionLassoSelection;
    let lassoPolygonalSelection: LassoPolygonalSelection;
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
    let pathData: Vec2[];
    // let isPointInPolygon: any;

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
        pathData = [
            { x: 0, y: 6 },
            { x: 45, y: 56 },
            { x: 3, y: 8 },
        ];
        // isPointInPolygon = false;

        rectangle = new Rectangle(mouseDownCoord, attributes, primaryColor, secondaryColor);
        const rectangleX = rectangle.x;
        const rectangleY = rectangle.y;
        const rectangleWidth = rectangle.width;
        const rectangleHeight = rectangle.height;

        actionLassoSelection = new ActionLassoSelection(pathData, rectangleX, rectangleY, rectangleWidth, rectangleHeight);
        lassoPolygonalSelection = new LassoPolygonalSelection(mouseDownCoord, attributes, primaryColor, secondaryColor, pathData);

        image = new Image();
        image.src = drawServiceSpy.canvas.toDataURL();

        actionLassoSelection.imageMoveSelect = {
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
        expect(actionLassoSelection).toBeTruthy();
    });

    it('execute should put clearImage and moveSelectImage.imageData', () => {
        const mousePosition = { x: 40, y: 40 };
        const height1 = 345;
        const width1 = 345;
        actionLassoSelection.rectangleX = mousePosition.x;
        actionLassoSelection.rectangleY = mousePosition.y;
        actionLassoSelection.rectangleWidth = width1;
        actionLassoSelection.rectangleHeight = height1;

        const putImageDataSpy = spyOn<any>(drawServiceSpy.baseCtx, 'putImageData').and.callThrough();
        const getImageDataSpy = spyOn<any>(drawServiceSpy.baseCtx, 'getImageData').and.callThrough();

        actionLassoSelection.execute(drawServiceSpy);

        const width = actionLassoSelection.rectangleWidth;
        const height = actionLassoSelection.rectangleHeight;
        const xPos = actionLassoSelection.rectangleX;
        const yPos = actionLassoSelection.rectangleY;
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
                if (lassoPolygonalSelection.contains(positionPixel)) {
                    expect(actionLassoSelection.clearImage.data[pixelCounter + indexRed]).toEqual(maxValue);
                    expect(actionLassoSelection.clearImage.data[pixelCounter + indexGreen]).toEqual(maxValue);
                    expect(actionLassoSelection.clearImage.data[pixelCounter + indexBlue]).toEqual(maxValue);
                    expect(actionLassoSelection.clearImage.data[pixelCounter + indexAlpha]).toEqual(maxValue);
                }
                pixelCounter += iterationNumber;
            }
        }
        expect(actionLassoSelection.clearImage).toBeDefined();
        expect(getImageDataSpy).toHaveBeenCalled();
        expect(putImageDataSpy).toHaveBeenCalled();
    });

    it('getImageMoveSelect should return imageMoveSelect property', () => {
        const result = actionLassoSelection.getImageMoveSelect();
        expect(result).toEqual(actionLassoSelection.imageMoveSelect);
    });

    it('setImageMoveSelect should set imageMoveSelect property', () => {
        const oldImageMoveSelect = actionLassoSelection.imageMoveSelect;
        actionLassoSelection.imageMoveSelect = {
            x: 10,
            y: 10,
            width: 10,
            height: 10,
            image,
            isImageFlippedHorizontally: true,
            isImageFlippedVertically: true,
        };
        expect(actionLassoSelection.imageMoveSelect).not.toEqual(oldImageMoveSelect);
    });
});
