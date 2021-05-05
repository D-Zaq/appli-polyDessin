import { TestBed } from '@angular/core/testing';
import { ActionRectangleSelection } from '@app/classes/action-object/action-rectangle-selection/action-rectangle-selection';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { BoundingBox } from '@app/classes/selections/bounding-box/bounding-box';
import { Rectangle } from '@app/classes/shapes/rectangle/rectangle';
import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { Vec2 } from '@app/classes/vec2';
import { DrawType } from '@app/constants/draw-type';
import { RectangleSelection } from './rectangle-selection';

describe('RectangleSelection', () => {
    // tslint:disable: no-string-literal
    // tslint:disable: no-any
    // tslint:disable: no-magic-numbers
    // reason: Tests (the same reason applies to other tslints in the file)
    let rectangleSelection: RectangleSelection;
    let boundingBoxSpy: jasmine.SpyObj<BoundingBox>;
    let canvasTestHelper: CanvasTestHelper;
    let previewCtxStub: CanvasRenderingContext2D;
    let strokeThickness: number;
    let attributes: ShapeAttribute;
    let primaryColor: string;
    let secondaryColor: string;

    beforeEach(() => {
        boundingBoxSpy = jasmine.createSpyObj('BoundingBox', ['draw', 'createControlPoints', 'updateControlPoints', 'updateDimensions', 'contains']);
        TestBed.configureTestingModule({
            providers: [{ provide: BoundingBox, useValue: boundingBoxSpy }],
        });

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        strokeThickness = 0.5;
        attributes = new ShapeAttribute(strokeThickness, DrawType.Outline);
        primaryColor = 'black';
        secondaryColor = 'black';
        const mouseDownCoord = { x: 35, y: 35 };
        rectangleSelection = new RectangleSelection(mouseDownCoord, attributes, primaryColor, secondaryColor);
        rectangleSelection.boundingBox = boundingBoxSpy;
    });

    it('should be created', () => {
        expect(rectangleSelection).toBeTruthy();
    });

    it('updateDimensions should call boundingBox.updateDimensions', () => {
        const mouseDownCoord = { x: 0, y: 0 };
        rectangleSelection.boundingBox.rectangle = new Rectangle(mouseDownCoord, attributes, primaryColor, secondaryColor);
        rectangleSelection.boundingBox.createControlPoints();
        const isShiftPressed = false;
        const anotherMousePosition: Vec2 = { x: 10, y: 10 };
        rectangleSelection.updateDimensions(anotherMousePosition, isShiftPressed);
        expect(boundingBoxSpy.updateDimensions).toHaveBeenCalled();
    });

    it('setLineDash should set previousLineDash property if it is undefined', () => {
        const setLineDashSpy = spyOn<any>(previewCtxStub, 'setLineDash').and.callThrough();
        const getLineDashSpy = spyOn<any>(previewCtxStub, 'getLineDash').and.callThrough();

        rectangleSelection.setLineDash(previewCtxStub);
        expect(rectangleSelection.previousLineDash).toBeDefined();
        expect(getLineDashSpy).toHaveBeenCalled();
        expect(setLineDashSpy).toHaveBeenCalled();
    });

    it('setLineDash should not set previousLineDash property if it is defined', () => {
        const setLineDashSpy = spyOn<any>(previewCtxStub, 'setLineDash').and.callThrough();
        const getLineDashSpy = spyOn<any>(previewCtxStub, 'getLineDash').and.callThrough();
        rectangleSelection.previousLineDash = [6];
        rectangleSelection.setLineDash(previewCtxStub);
        expect(rectangleSelection.previousLineDash).toBeDefined();
        expect(getLineDashSpy).not.toHaveBeenCalled();
        expect(setLineDashSpy).toHaveBeenCalled();
    });

    it('resetLineDash should call ctx.setLineDash if previousLineDash is defined', () => {
        const setLineDashSpy = spyOn<any>(previewCtxStub, 'setLineDash').and.callThrough();
        rectangleSelection.previousLineDash = [6];
        rectangleSelection.resetLineDash(previewCtxStub);
        expect(setLineDashSpy).toHaveBeenCalled();
    });

    it('resetLineDash should not call ctx.setLineDash  if previousLineDash is undefined', () => {
        const setLineDashSpy = spyOn<any>(previewCtxStub, 'setLineDash').and.callThrough();
        rectangleSelection.resetLineDash(previewCtxStub);
        expect(setLineDashSpy).not.toHaveBeenCalled();
    });

    it('draw should call boundingBox.draw', () => {
        const mouseDownCoord = { x: 0, y: 0 };
        rectangleSelection.boundingBox.rectangle = new Rectangle(mouseDownCoord, attributes, primaryColor, secondaryColor);
        rectangleSelection.boundingBox.createControlPoints();
        rectangleSelection.draw(previewCtxStub);
        expect(boundingBoxSpy.draw).toHaveBeenCalledWith(previewCtxStub);
    });

    it('contains should call boundingBox.contains', () => {
        const mousePosition: Vec2 = { x: 10, y: 10 };
        rectangleSelection.contains(mousePosition);
        expect(boundingBoxSpy.contains).toHaveBeenCalledWith(mousePosition);
    });

    it('saveSelectedPixels should set the imageData property', () => {
        const mouseDownCoord = { x: 30, y: 30 };
        rectangleSelection.boundingBox.rectangle = new Rectangle(mouseDownCoord, attributes, primaryColor, secondaryColor);
        rectangleSelection.boundingBox.createControlPoints();
        const mousePosition = { x: 10, y: 10 };
        rectangleSelection.boundingBox.rectangle.updateDimensions(mousePosition);
        const getImageDataSpy = spyOn<any>(previewCtxStub, 'getImageData').and.callThrough();

        rectangleSelection.saveSelectedPixels(previewCtxStub);
        expect(getImageDataSpy).toHaveBeenCalled();
        expect(rectangleSelection.imageData).toBeDefined();
    });

    it('saveSelectedPixels should not set the imageData property if width and height are 0', () => {
        const mouseDownCoord = { x: 0, y: 0 };
        rectangleSelection.boundingBox.rectangle = new Rectangle(mouseDownCoord, attributes, primaryColor, secondaryColor);
        rectangleSelection.boundingBox.createControlPoints();
        const mousePosition = { x: 0, y: 0 };
        rectangleSelection.boundingBox.rectangle.updateDimensions(mousePosition);
        const getImageDataSpy = spyOn<any>(previewCtxStub, 'getImageData').and.callThrough();

        rectangleSelection.saveSelectedPixels(previewCtxStub);
        expect(getImageDataSpy).not.toHaveBeenCalled();
        expect(rectangleSelection.imageData).not.toBeDefined();
    });

    it('saveSelectedPixels should change transparent pixels to white', () => {
        const mouseDownCoord = { x: 30, y: 30 };
        rectangleSelection.boundingBox.rectangle = new Rectangle(mouseDownCoord, attributes, primaryColor, secondaryColor);
        rectangleSelection.boundingBox.createControlPoints();
        const mousePosition = { x: 40, y: 40 };
        rectangleSelection.boundingBox.rectangle.updateDimensions(mousePosition);

        previewCtxStub.fillStyle = 'black';
        previewCtxStub.fillRect(35, 35, 40, 40);

        rectangleSelection.saveSelectedPixels(previewCtxStub);

        const width = rectangleSelection.boundingBox.rectangle.width;
        const height = rectangleSelection.boundingBox.rectangle.height;
        const xPos = rectangleSelection.boundingBox.rectangle.x;
        const yPos = rectangleSelection.boundingBox.rectangle.y;
        const startRow = yPos;
        const limitRow = yPos + height;
        const startCol = xPos;
        const limitCol = xPos + width;
        let pixelCounter = 0;
        const indexRed = 0;
        const indexGreen = 1;
        const indexBlue = 2;
        const indexAlpha = 3;
        const iterationNumber = 4;
        const maxValue = 255;

        for (let i = startRow; i < limitRow; i++) {
            for (let j = startCol; j < limitCol; j++) {
                if (rectangleSelection.imageData.data[pixelCounter + indexAlpha] === 0) {
                    expect(rectangleSelection.imageData.data[pixelCounter + indexRed]).toEqual(maxValue);
                    expect(rectangleSelection.imageData.data[pixelCounter + indexGreen]).toEqual(maxValue);
                    expect(rectangleSelection.imageData.data[pixelCounter + indexBlue]).toEqual(maxValue);
                    expect(rectangleSelection.imageData.data[pixelCounter + indexAlpha]).toEqual(maxValue);
                }
                pixelCounter += iterationNumber;
            }
        }
        expect(rectangleSelection.imageData).toBeDefined();
    });

    it('updateDimensionsMove should change rectanglex.x/y and call boundingbox.updateControlPoints', () => {
        const xDistance = 6;
        const yDistance = 6;

        const mouseDownCoord = { x: 30, y: 30 };
        rectangleSelection.boundingBox.rectangle = new Rectangle(mouseDownCoord, attributes, primaryColor, secondaryColor);
        rectangleSelection.boundingBox.createControlPoints();
        const mousePosition = { x: 40, y: 40 };
        rectangleSelection.boundingBox.rectangle.updateDimensions(mousePosition);

        const oldRectangleX = rectangleSelection.boundingBox.rectangle.x;
        const oldRectangleY = rectangleSelection.boundingBox.rectangle.y;
        rectangleSelection.updateDimensionsMove(xDistance, yDistance);
        expect(rectangleSelection.boundingBox.rectangle.x).not.toEqual(oldRectangleX);
        expect(rectangleSelection.boundingBox.rectangle.y).not.toEqual(oldRectangleY);
        expect(boundingBoxSpy.updateControlPoints).toHaveBeenCalled();
    });

    /*it('drawImage should call ctx.drawImage', () => {
        const mouseDownCoord = { x: 30, y: 30 };
        rectangleSelection.boundingBox.rectangle = new Rectangle(mouseDownCoord, attributes, primaryColor, secondaryColor);
        const drawImageSpy = spyOn<any>(previewCtxStub, 'drawImage').and.callThrough();
        rectangleSelection.imageData = previewCtxStub.getImageData(
            rectangleSelection.boundingBox.rectangle.x,
            rectangleSelection.boundingBox.rectangle.y,
            1,
            1,
        );
        rectangleSelection.drawImage(previewCtxStub);
        expect(drawImageSpy).toHaveBeenCalled();
    });

    it('drawImage should not call ctx.drawImage if image is undefined', () => {
        const mouseDownCoord = { x: 30, y: 30 };
        rectangleSelection.boundingBox.rectangle = new Rectangle(mouseDownCoord, attributes, primaryColor, secondaryColor);
        rectangleSelection.boundingBox.rectangle.width = 5;
        rectangleSelection.boundingBox.rectangle.height = 5;

        const drawImageSpy = spyOn<any>(previewCtxStub, 'drawImage').and.callThrough();
        rectangleSelection.drawImage(previewCtxStub);
        expect(drawImageSpy).not.toHaveBeenCalled();
    });*/

    it('createActionObject should return an object of type ActionRectangleSelection', () => {
        const mouseDownCoord = { x: 30, y: 30 };
        rectangleSelection.boundingBox.rectangle = new Rectangle(mouseDownCoord, attributes, primaryColor, secondaryColor);
        const result = rectangleSelection.createActionObject();
        expect(result instanceof ActionRectangleSelection).toBe(true);
    });
});
