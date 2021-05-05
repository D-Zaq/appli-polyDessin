import { TestBed } from '@angular/core/testing';
import { ActionEllipseSelection } from '@app/classes/action-object/action-ellipse-selection/action-ellipse-selection';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { BoundingBox } from '@app/classes/selections/bounding-box/bounding-box';
import { Ellipse } from '@app/classes/shapes/ellipse/ellipse';
import { Rectangle } from '@app/classes/shapes/rectangle/rectangle';
import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { Vec2 } from '@app/classes/vec2';
import { DrawType } from '@app/constants/draw-type';
import { EllipseSelection } from './ellipse-selection';

describe('EllipseSelection', () => {
    // tslint:disable: no-string-literal
    // tslint:disable: no-any
    // tslint:disable: no-magic-numbers
    // reason: Tests (the same reason applies to other tslints in the file)
    let ellipseSelection: EllipseSelection;
    let ellipseSpy: jasmine.SpyObj<Ellipse>;
    let boundingBoxSpy: jasmine.SpyObj<BoundingBox>;
    let canvasTestHelper: CanvasTestHelper;
    let previewCtxStub: CanvasRenderingContext2D;
    let strokeThickness: number;
    let attributes: ShapeAttribute;
    let primaryColor: string;
    let secondaryColor: string;

    beforeEach(() => {
        ellipseSpy = jasmine.createSpyObj('Ellipse', ['draw', 'contains', 'updateDimensions', 'clone']);
        boundingBoxSpy = jasmine.createSpyObj('BoundingBox', ['draw', 'createControlPoints', 'updateControlPoints', 'updateDimensions']);
        TestBed.configureTestingModule({
            providers: [
                { provide: Ellipse, useValue: ellipseSpy },
                { provide: BoundingBox, useValue: boundingBoxSpy },
            ],
        });

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        strokeThickness = 0.5;
        attributes = new ShapeAttribute(strokeThickness, DrawType.Outline);
        primaryColor = 'black';
        secondaryColor = 'black';
        const mouseDownCoord = { x: 35, y: 35 };
        ellipseSelection = new EllipseSelection(mouseDownCoord, attributes, primaryColor, secondaryColor);
        ellipseSelection.ellipse = ellipseSpy;
        ellipseSelection.boundingBox = boundingBoxSpy;
    });

    it('should be created', () => {
        expect(ellipseSelection).toBeTruthy();
    });

    it('updateDimensions should call ellipse.updateDimensions and boundingBox.updateControlPoints', () => {
        const mouseDownCoord = { x: 0, y: 0 };
        ellipseSelection.boundingBox.rectangle = new Rectangle(mouseDownCoord, attributes, primaryColor, secondaryColor);

        ellipseSelection.boundingBox.createControlPoints();

        const mousePosition: Vec2 = { x: 5, y: 5 };
        const isShiftPressed = false;
        ellipseSelection.ellipse.updateDimensions(mousePosition, isShiftPressed);

        const anotherMousePosition: Vec2 = { x: 10, y: 10 };
        ellipseSelection.updateDimensions(anotherMousePosition, isShiftPressed);

        expect(ellipseSpy.updateDimensions).toHaveBeenCalled();
        expect(boundingBoxSpy.updateControlPoints).toHaveBeenCalled();
    });

    it('setLineDash should set previousLineDash property if it is undefined', () => {
        const setLineDashSpy = spyOn<any>(previewCtxStub, 'setLineDash').and.callThrough();
        const getLineDashSpy = spyOn<any>(previewCtxStub, 'getLineDash').and.callThrough();

        ellipseSelection.setLineDash(previewCtxStub);
        expect(ellipseSelection.previousLineDash).toBeDefined();
        expect(getLineDashSpy).toHaveBeenCalled();
        expect(setLineDashSpy).toHaveBeenCalled();
    });

    it('setLineDash should not set previousLineDash property if it is defined', () => {
        const setLineDashSpy = spyOn<any>(previewCtxStub, 'setLineDash').and.callThrough();
        const getLineDashSpy = spyOn<any>(previewCtxStub, 'getLineDash').and.callThrough();
        ellipseSelection.previousLineDash = [6];
        ellipseSelection.setLineDash(previewCtxStub);
        expect(ellipseSelection.previousLineDash).toBeDefined();
        expect(getLineDashSpy).not.toHaveBeenCalled();
        expect(setLineDashSpy).toHaveBeenCalled();
    });

    it('resetLineDash should call ctx.setLineDash if previousLineDash is defined', () => {
        const setLineDashSpy = spyOn<any>(previewCtxStub, 'setLineDash').and.callThrough();
        ellipseSelection.previousLineDash = [6];
        ellipseSelection.resetLineDash(previewCtxStub);
        expect(setLineDashSpy).toHaveBeenCalled();
    });

    it('resetLineDash should not call ctx.setLineDash  if previousLineDash is undefined', () => {
        const setLineDashSpy = spyOn<any>(previewCtxStub, 'setLineDash').and.callThrough();
        ellipseSelection.resetLineDash(previewCtxStub);
        expect(setLineDashSpy).not.toHaveBeenCalled();
    });

    it('draw should call ellipse.draw and boundingBox.draw', () => {
        const mouseDownCoord = { x: 0, y: 0 };
        ellipseSelection.boundingBox.rectangle = new Rectangle(mouseDownCoord, attributes, primaryColor, secondaryColor);
        ellipseSelection.boundingBox.createControlPoints();

        ellipseSelection.draw(previewCtxStub);

        expect(ellipseSpy.draw).toHaveBeenCalledWith(previewCtxStub);
        expect(boundingBoxSpy.draw).toHaveBeenCalledWith(previewCtxStub);
    });

    it('contains should call ellipse.contains', () => {
        const mousePosition: Vec2 = { x: 10, y: 10 };
        ellipseSelection.contains(mousePosition);
        expect(ellipseSpy.contains).toHaveBeenCalledWith(mousePosition);
    });

    it('saveSelectedPixels should set the imageData property', () => {
        const mouseDownCoord = { x: 30, y: 30 };
        ellipseSelection.boundingBox.rectangle = new Rectangle(mouseDownCoord, attributes, primaryColor, secondaryColor);
        ellipseSelection.boundingBox.createControlPoints();
        const mousePosition = { x: 10, y: 10 };
        ellipseSelection.boundingBox.rectangle.updateDimensions(mousePosition);
        const getImageDataSpy = spyOn<any>(previewCtxStub, 'getImageData').and.callThrough();

        ellipseSelection.saveSelectedPixels(previewCtxStub);
        expect(getImageDataSpy).toHaveBeenCalled();
        expect(ellipseSelection.imageData).toBeDefined();
    });

    it('saveSelectedPixels should keep pixels inside ellipse and change others to white if they are transparent', () => {
        const mouseDownCoord = { x: 35, y: 35 };
        ellipseSelection.ellipse = new Ellipse(mouseDownCoord, attributes, primaryColor, secondaryColor);
        const isShiftPressed = false;
        const mousePosition = { x: 40, y: 40 };
        ellipseSelection.boundingBox.rectangle = new Rectangle(mousePosition, attributes, primaryColor, secondaryColor);
        ellipseSelection.ellipse.updateDimensions(mousePosition, isShiftPressed);
        ellipseSelection.boundingBox.rectangle.x = ellipseSelection.ellipse.x - ellipseSelection.ellipse.radiusX;
        ellipseSelection.boundingBox.rectangle.y = ellipseSelection.ellipse.y - ellipseSelection.ellipse.radiusY;
        ellipseSelection.boundingBox.rectangle.width = ellipseSelection.ellipse.radiusX * 2;
        ellipseSelection.boundingBox.rectangle.height = ellipseSelection.ellipse.radiusY * 2;
        ellipseSelection.boundingBox.updateControlPoints();

        previewCtxStub.fillStyle = 'black';
        previewCtxStub.fillRect(36, 36, 3, 3);

        ellipseSelection.saveSelectedPixels(previewCtxStub);

        const width = ellipseSelection.boundingBox.rectangle.width;
        const height = ellipseSelection.boundingBox.rectangle.height;
        const xPos = ellipseSelection.boundingBox.rectangle.x;
        const yPos = ellipseSelection.boundingBox.rectangle.y;
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
                if (!ellipseSelection.ellipse.contains(positionPixel)) {
                    expect(ellipseSelection.imageData.data[pixelCounter + indexAlpha]).toEqual(0);
                } else if (ellipseSelection.imageData.data[pixelCounter + indexAlpha] === 0) {
                    expect(ellipseSelection.imageData.data[pixelCounter + indexRed]).toEqual(maxValue);
                    expect(ellipseSelection.imageData.data[pixelCounter + indexGreen]).toEqual(maxValue);
                    expect(ellipseSelection.imageData.data[pixelCounter + indexBlue]).toEqual(maxValue);
                    expect(ellipseSelection.imageData.data[pixelCounter + indexAlpha]).toEqual(maxValue);
                }
                pixelCounter += iterationNumber;
            }
        }
        expect(ellipseSelection.imageData).toBeDefined();
    });

    it('updateDimensionsMove should change ellipse.x/y, rectanglex.x/y and call boundingbox.updateControlPoints', () => {
        const xDistance = 6;
        const yDistance = 6;

        const mouseDownCoord = { x: 30, y: 30 };
        ellipseSelection.boundingBox.rectangle = new Rectangle(mouseDownCoord, attributes, primaryColor, secondaryColor);
        ellipseSelection.boundingBox.createControlPoints();
        const mousePosition = { x: 40, y: 40 };
        ellipseSelection.boundingBox.rectangle.updateDimensions(mousePosition);

        const oldRectangleX = ellipseSelection.boundingBox.rectangle.x;
        const oldRectangleY = ellipseSelection.boundingBox.rectangle.y;
        ellipseSelection.updateDimensionsMove(xDistance, yDistance);
        expect(ellipseSelection.boundingBox.rectangle.x).not.toEqual(oldRectangleX);
        expect(ellipseSelection.boundingBox.rectangle.y).not.toEqual(oldRectangleY);
        expect(boundingBoxSpy.updateControlPoints).toHaveBeenCalled();
    });

    /*it('drawImage should call ctx.drawImage', () => {
        const mouseDownCoord = { x: 30, y: 30 };
        ellipseSelection.boundingBox.rectangle = new Rectangle(mouseDownCoord, attributes, primaryColor, secondaryColor);
        const drawImageSpy = spyOn<any>(previewCtxStub, 'drawImage').and.callThrough();
        ellipseSelection.imageData = previewCtxStub.getImageData(
            ellipseSelection.boundingBox.rectangle.x,
            ellipseSelection.boundingBox.rectangle.y,
            1,
            1,
        );
        ellipseSelection.drawImage(previewCtxStub);
        expect(drawImageSpy).toHaveBeenCalled();
    });*/

    it('createActionObject should return an object of type ActionEllipseSelection', () => {
        const isShiftPressed = false;
        const mousePosition = { x: 40, y: 40 };
        ellipseSelection.boundingBox.rectangle = new Rectangle(mousePosition, attributes, primaryColor, secondaryColor);
        ellipseSelection.ellipse.updateDimensions(mousePosition, isShiftPressed);
        ellipseSelection.boundingBox.rectangle.x = ellipseSelection.ellipse.x - ellipseSelection.ellipse.radiusX;
        ellipseSelection.boundingBox.rectangle.y = ellipseSelection.ellipse.y - ellipseSelection.ellipse.radiusY;
        ellipseSelection.boundingBox.rectangle.width = ellipseSelection.ellipse.radiusX * 2;
        ellipseSelection.boundingBox.rectangle.height = ellipseSelection.ellipse.radiusY * 2;
        const result = ellipseSelection.createActionObject();
        expect(ellipseSpy.clone).toHaveBeenCalled();
        expect(result instanceof ActionEllipseSelection).toBe(true);
    });
});
