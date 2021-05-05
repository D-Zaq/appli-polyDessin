import { TestBed } from '@angular/core/testing';
import { ActionLassoSelection } from '@app/classes/action-object/action-lasso-polygonal-selection/action-lasso-polygonal-selection';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { BoundingBox } from '@app/classes/selections/bounding-box/bounding-box';
import { Rectangle } from '@app/classes/shapes/rectangle/rectangle';
import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { Vec2 } from '@app/classes/vec2';
import { DrawType } from '@app/constants/draw-type';
import { LassoPolygonalSelection } from './lasso-polygonal-selection';

describe('LassoPolygonalSelection', () => {
    // tslint:disable: no-string-literal
    // tslint:disable: no-any
    // tslint:disable: no-magic-numbers
    // reason: Tests (the same reason applies to other tslints in the file)
    let lassoSelection: LassoPolygonalSelection;
    // let Spy: jasmine.SpyObj<Ellipse>;
    let boundingBoxSpy: jasmine.SpyObj<BoundingBox>;
    let canvasTestHelper: CanvasTestHelper;
    let previewCtxStub: CanvasRenderingContext2D;
    let strokeThickness: number;
    let attributes: ShapeAttribute;
    let primaryColor: string;
    let secondaryColor: string;
    // let ctxContains: CanvasRenderingContext2D;
    let pathData: Vec2[];

    beforeEach(() => {
        // ellipseSpy = jasmine.createSpyObj('Ellipse', ['draw', 'contains', 'updateDimensions', 'clone']);
        boundingBoxSpy = jasmine.createSpyObj('BoundingBox', ['draw', 'createControlPoints', 'updateControlPoints', 'updateDimensions']);
        TestBed.configureTestingModule({
            providers: [
                // { provide: Ellipse, useValue: ellipseSpy },
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
        pathData = [
            { x: 0, y: 6 },
            { x: 45, y: 56 },
            { x: 3, y: 8 },
        ];
        lassoSelection = new LassoPolygonalSelection(mouseDownCoord, attributes, primaryColor, secondaryColor, pathData);
        lassoSelection.boundingBox = boundingBoxSpy;
    });

    it('should be created', () => {
        expect(lassoSelection).toBeTruthy();
    });

    it('updateDimensionsMove should call boundingBox.updateControlPoints', () => {
        // const mouseDownCoord = { x: 0, y: 0 };
        // lassoSelection.boundingBox.rectangle = new Rectangle(mouseDownCoord, attributes, primaryColor, secondaryColor);
        // const updateDimensionsMove = spyOn(boundingBoxSpy, 'updateControlPoints').and.callThrough();
        // lassoSelection.boundingBox.createControlPoints();

        // // const mousePosition: Vec2 = { x: 5, y: 5 };
        // // lassoSelection.updateDimensions(mousePosition, isShiftPressed);

        // // const anotherMousePosition: Vec2 = { x: 10, y: 10 };
        // // ellipseSelection.updateDimensions(anotherMousePosition, isShiftPressed);

        // expect(updateDimensionsMove).toHaveBeenCalled();

        const xDistance = 6;
        const yDistance = 6;

        const mouseDownCoord = { x: 30, y: 30 };
        lassoSelection.boundingBox.rectangle = new Rectangle(mouseDownCoord, attributes, primaryColor, secondaryColor);
        lassoSelection.boundingBox.createControlPoints();
        const mousePosition = { x: 40, y: 40 };
        lassoSelection.boundingBox.rectangle.updateDimensions(mousePosition);

        const oldRectangleX = lassoSelection.boundingBox.rectangle.x;
        const oldRectangleY = lassoSelection.boundingBox.rectangle.y;
        lassoSelection.updateDimensionsMove(xDistance, yDistance);
        expect(lassoSelection.boundingBox.rectangle.x).not.toEqual(oldRectangleX);
        expect(lassoSelection.boundingBox.rectangle.y).not.toEqual(oldRectangleY);
        expect(boundingBoxSpy.updateControlPoints).toHaveBeenCalled();
    });

    // it('setLineDash should set previousLineDash property if it is undefined', () => {
    //     const setLineDashSpy = spyOn<any>(previewCtxStub, 'setLineDash').and.callThrough();
    //     const getLineDashSpy = spyOn<any>(previewCtxStub, 'getLineDash').and.callThrough();

    //     lassoSelection.setLineDash(previewCtxStub);
    //     expect(lassoSelection.previousLineDash).toBeDefined();
    //     expect(getLineDashSpy).toHaveBeenCalled();
    //     expect(setLineDashSpy).toHaveBeenCalled();
    // });

    // it('setLineDash should not set previousLineDash property if it is defined', () => {
    //     const setLineDashSpy = spyOn<any>(previewCtxStub, 'setLineDash').and.callThrough();
    //     const getLineDashSpy = spyOn<any>(previewCtxStub, 'getLineDash').and.callThrough();
    //     lassoSelection.previousLineDash = [6];
    //     lassoSelection.setLineDash(previewCtxStub);
    //     expect(lassoSelection.previousLineDash).toBeDefined();
    //     expect(getLineDashSpy).not.toHaveBeenCalled();
    //     expect(setLineDashSpy).toHaveBeenCalled();
    // });

    // it('resetLineDash should not call ctx.setLineDash  if previousLineDash is undefined', () => {
    //     const setLineDashSpy = spyOn<any>(previewCtxStub, 'setLineDash').and.callThrough();
    //     lassoSelection.resetLineDash(previewCtxStub);
    //     expect(setLineDashSpy).not.toHaveBeenCalled();
    // });

    it('draw should call and boundingBox.draw', () => {
        const mouseDownCoord = { x: 0, y: 0 };
        lassoSelection.boundingBox.rectangle = new Rectangle(mouseDownCoord, attributes, primaryColor, secondaryColor);
        lassoSelection.boundingBox.createControlPoints();

        lassoSelection.draw(previewCtxStub);

        expect(boundingBoxSpy.draw).toHaveBeenCalledWith(previewCtxStub);
    });

    it('saveSelectedPixels should set the imageData property', () => {
        const mouseDownCoord = { x: 30, y: 30 };
        lassoSelection.boundingBox.rectangle = new Rectangle(mouseDownCoord, attributes, primaryColor, secondaryColor);
        lassoSelection.boundingBox.createControlPoints();
        const mousePosition = { x: 10, y: 10 };
        lassoSelection.boundingBox.rectangle.updateDimensions(mousePosition);
        const getImageDataSpy = spyOn<any>(previewCtxStub, 'getImageData').and.callThrough();

        lassoSelection.saveSelectedPixels(previewCtxStub);
        expect(getImageDataSpy).toHaveBeenCalled();
        expect(lassoSelection.imageData).toBeDefined();
    });

    it('saveSelectedPixels should keep pixels inside lasso and change others to white if they are transparent', () => {
        const mouseDownCoord = { x: 35, y: 35 };
        const height1 = 98;
        const width1 = 120;
        // ellipseSelection.ellipse = new Ellipse(mouseDownCoord, attributes, primaryColor, secondaryColor);
        const mousePosition = { x: 40, y: 40 };
        lassoSelection.boundingBox.rectangle = new Rectangle(mousePosition, attributes, primaryColor, secondaryColor);
        // lassoSelection.ellipse.updateDimensions(mousePosition, isShiftPressed);
        lassoSelection.boundingBox.rectangle.x = mouseDownCoord.x;
        lassoSelection.boundingBox.rectangle.y = mouseDownCoord.y;
        lassoSelection.boundingBox.rectangle.width = width1;
        lassoSelection.boundingBox.rectangle.height = height1;
        lassoSelection.boundingBox.updateControlPoints();

        previewCtxStub.fillStyle = 'black';
        previewCtxStub.fillRect(36, 36, 3, 3);

        lassoSelection.saveSelectedPixels(previewCtxStub);

        const width = lassoSelection.boundingBox.rectangle.width;
        const height = lassoSelection.boundingBox.rectangle.height;
        const xPos = lassoSelection.boundingBox.rectangle.x;
        const yPos = lassoSelection.boundingBox.rectangle.y;
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
                if (!lassoSelection.contains(positionPixel)) {
                    expect(lassoSelection.imageData.data[pixelCounter + indexAlpha]).toEqual(0);
                } else if (lassoSelection.imageData.data[pixelCounter + indexAlpha] === 0) {
                    expect(lassoSelection.imageData.data[pixelCounter + indexRed]).toEqual(maxValue);
                    expect(lassoSelection.imageData.data[pixelCounter + indexGreen]).toEqual(maxValue);
                    expect(lassoSelection.imageData.data[pixelCounter + indexBlue]).toEqual(maxValue);
                    expect(lassoSelection.imageData.data[pixelCounter + indexAlpha]).toEqual(maxValue);
                }
                pixelCounter += iterationNumber;
            }
        }
        expect(lassoSelection.imageData).toBeDefined();
    });

    // it('updateDimensionsMove should change ellipse.x/y, rectanglex.x/y and call boundingbox.updateControlPoints', () => {
    //     const xDistance = 6;
    //     const yDistance = 6;

    //     const oldEllipseX = ellipseSelection.ellipse.x;
    //     const oldEllipseY = ellipseSelection.ellipse.y;
    //     const mouseDownCoord = { x: 30, y: 30 };
    //     ellipseSelection.boundingBox.rectangle = new Rectangle(mouseDownCoord, attributes, primaryColor, secondaryColor);
    //     ellipseSelection.boundingBox.createControlPoints();
    //     const mousePosition = { x: 40, y: 40 };
    //     ellipseSelection.boundingBox.rectangle.updateDimensions(mousePosition);

    //     const oldRectangleX = ellipseSelection.boundingBox.rectangle.x;
    //     const oldRectangleY = ellipseSelection.boundingBox.rectangle.y;
    //     ellipseSelection.updateDimensionsMove(xDistance, yDistance);
    //     expect(ellipseSelection.ellipse.x).not.toEqual(oldEllipseX);
    //     expect(ellipseSelection.ellipse.y).not.toEqual(oldEllipseY);
    //     expect(ellipseSelection.boundingBox.rectangle.x).not.toEqual(oldRectangleX);
    //     expect(ellipseSelection.boundingBox.rectangle.y).not.toEqual(oldRectangleY);
    //     expect(boundingBoxSpy.updateControlPoints).toHaveBeenCalled();
    // });

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

    it('createActionObject should return an object of type ActionLassoSelection', () => {
        const height = 234;
        const width = 356;
        const mousePosition = { x: 40, y: 40 };
        lassoSelection.boundingBox.rectangle = new Rectangle(mousePosition, attributes, primaryColor, secondaryColor);
        lassoSelection.boundingBox.rectangle.x = mousePosition.x;
        lassoSelection.boundingBox.rectangle.y = mousePosition.x;
        lassoSelection.boundingBox.rectangle.width = width;
        lassoSelection.boundingBox.rectangle.height = height;
        const result = lassoSelection.createActionObject();
        expect(result instanceof ActionLassoSelection).toBe(true);
    });
});
