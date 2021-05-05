import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { Vec2 } from '@app/classes/vec2';
import { DrawType } from '@app/constants/draw-type';
import { Rectangle } from './rectangle';

describe('Rectangle', () => {
    // tslint:disable: no-string-literal
    // tslint:disable: no-any
    // tslint:disable: no-magic-numbers
    // reason: Tests (the same reason applies to other tslints in the file)
    let rectangle: Rectangle;
    let canvasTestHelper: CanvasTestHelper;
    let previewCtxStub: CanvasRenderingContext2D;
    let canvasStub: HTMLCanvasElement;
    let mouseDownCoord: Vec2;
    let strokeThickness: number;
    let attributes: ShapeAttribute;

    beforeEach(() => {
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        canvasStub = canvasTestHelper.canvas;
        mouseDownCoord = { x: 0, y: 0 };
        strokeThickness = 0.5;
        attributes = new ShapeAttribute(strokeThickness, DrawType.Outline);
        const primaryColor = '#000000';
        const secondaryColor = '#000000';
        rectangle = new Rectangle(mouseDownCoord, attributes, primaryColor, secondaryColor);
    });

    it('should be created', () => {
        expect(rectangle).toBeTruthy();
    });

    it(' updateDimensions should modify rectangle dimensions properties', () => {
        rectangle.mouseDownCoord.x = 5;
        rectangle.mouseDownCoord.y = 5;
        const mousePosition = { x: 6, y: 6 };
        rectangle.updateDimensions(mousePosition);
        expect(rectangle.width).toEqual(1);
        expect(rectangle.height).toEqual(1);
    });

    it(' updateDimensions should not modify rectangle dimensions properties again if isKeyPressed is false', () => {
        rectangle.mouseDownCoord.x = 10;
        rectangle.mouseDownCoord.y = 10;
        const isKeyPressed = false;
        const mousePosition = { x: 30, y: 35 };
        rectangle.updateDimensions(mousePosition, isKeyPressed);
        expect(rectangle.width).toEqual(20);
        expect(rectangle.height).toEqual(25);
    });

    it(' updateDimensions should set the height property to width value if isKeyPressed and if height < 0 and width < 0 ', () => {
        rectangle.mouseDownCoord.x = 20;
        rectangle.mouseDownCoord.y = 7;
        const isKeyPressed = true;
        const mousePosition = { x: 7, y: 6 };
        rectangle.updateDimensions(mousePosition, isKeyPressed);
        expect(rectangle.height).toEqual(rectangle.width);
    });

    it(' updateDimensions should set the width property to height value if isKeyPressed and if width < 0 and height < 0 ', () => {
        rectangle.mouseDownCoord.x = 6;
        rectangle.mouseDownCoord.y = 25;
        const isKeyPressed = true;
        const mousePosition = { x: 5, y: 5 };
        rectangle.updateDimensions(mousePosition, isKeyPressed);
        expect(rectangle.width).toEqual(rectangle.height);
    });

    it(' draw should not change the state of the context', () => {
        const previousCtx = previewCtxStub;

        rectangle.draw(previewCtxStub);
        expect(previewCtxStub).toEqual(previousCtx);
    });

    it(' draw should change the canvas', () => {
        const prevCanvasImage = previewCtxStub.getImageData(0, 0, canvasStub.width, canvasStub.height);

        rectangle.draw(previewCtxStub);
        const newCanvasImage = previewCtxStub.getImageData(0, 0, canvasStub.width, canvasStub.height);
        expect(newCanvasImage).toEqual(prevCanvasImage);
    });

    it(' draw should call ctx.fill if DrawType.Fill', () => {
        attributes = new ShapeAttribute(strokeThickness, DrawType.Fill);
        rectangle = new Rectangle(mouseDownCoord, attributes, '#000000', '#000000');
        const fillSpy = spyOn<any>(previewCtxStub, 'fill').and.callThrough();
        rectangle.draw(previewCtxStub);
        expect(fillSpy).toHaveBeenCalled();
    });

    it(' draw should call ctx.stroke if DrawType.Outline', () => {
        attributes = new ShapeAttribute(strokeThickness, DrawType.Outline);
        rectangle = new Rectangle(mouseDownCoord, attributes, '#000000', '#000000');
        const strokeSpy = spyOn<any>(previewCtxStub, 'stroke').and.callThrough();
        rectangle.draw(previewCtxStub);
        expect(strokeSpy).toHaveBeenCalled();
    });

    it(' draw should call ctx.stroke and ctx.fill if DrawType.OutlineFill', () => {
        attributes = new ShapeAttribute(strokeThickness, DrawType.OutlineFill);
        rectangle = new Rectangle(mouseDownCoord, attributes, '#000000', '#000000');
        const fillSpy = spyOn<any>(previewCtxStub, 'fill').and.callThrough();
        const strokeSpy = spyOn<any>(previewCtxStub, 'stroke').and.callThrough();
        rectangle.draw(previewCtxStub);
        expect(strokeSpy).toHaveBeenCalled();
        expect(fillSpy).toHaveBeenCalled();
    });
});
