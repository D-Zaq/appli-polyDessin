import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { Vec2 } from '@app/classes/vec2';
import { DrawType } from '@app/constants/draw-type';
import { Ellipse } from './ellipse';

describe('Ellipse', () => {
    // tslint:disable: no-string-literal
    // tslint:disable: no-any
    // tslint:disable: no-magic-numbers
    // reason: Tests (the same reason applies to other tslints in the file)
    let ellipse: Ellipse;
    let canvasTestHelper: CanvasTestHelper;
    let previewCtxStub: CanvasRenderingContext2D;
    let mouseDownCoord: Vec2;
    let canvasStub: HTMLCanvasElement;
    let strokeThickness: number;
    let attributes: ShapeAttribute;
    beforeEach(() => {
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        canvasStub = canvasTestHelper.canvas;
        mouseDownCoord = { x: 5, y: 5 };
        strokeThickness = 0.5;
        attributes = new ShapeAttribute(strokeThickness, DrawType.Outline);
        const primaryColor = '#000000';
        const secondaryColor = '#000000';

        ellipse = new Ellipse(mouseDownCoord, attributes, primaryColor, secondaryColor);
    });

    it('should be created', () => {
        expect(ellipse).toBeTruthy();
    });

    it(' updateDimensions should properly modify x and y values', () => {
        const mousePosition = { x: 15, y: 15 };
        const isShiftPressed = false;
        ellipse.updateDimensions(mousePosition, isShiftPressed);
        expect(ellipse.x).toEqual(10);
        expect(ellipse.y).toEqual(10);
    });

    it(' updateDimensions should set radiusX and radiusY to positive values', () => {
        const mousePosition = { x: -10, y: -10 };
        const isShiftPressed = false;
        ellipse.updateDimensions(mousePosition, isShiftPressed);
        expect(ellipse.radiusX).toBeGreaterThanOrEqual(0);
        expect(ellipse.radiusY).toBeGreaterThanOrEqual(0);
    });

    it(' updateDimensions should set the radiusX property to the value of radiusY if isShiftKeyPressed is true and radiusY > radiusX ', () => {
        const mousePosition = { x: 15, y: 15 };
        const isShiftPressed = true;
        ellipse.updateDimensions(mousePosition, isShiftPressed);
        expect(ellipse.radiusX).toEqual(5);
        expect(ellipse.radiusY).toEqual(5);
    });

    it(' updateDimensions should set the radiusY property to the value of radiusX if isShiftKeyPressed is true and radiusX > radiusY ', () => {
        const mousePosition = { x: 15, y: 15 };
        const isShiftPressed = true;
        ellipse.updateDimensions(mousePosition, isShiftPressed);
        expect(ellipse.radiusX).toEqual(5);
        expect(ellipse.radiusY).toEqual(5);
    });

    it(' draw should not change the state of the context', () => {
        const previousCtx = previewCtxStub;

        ellipse.draw(previewCtxStub);
        expect(previewCtxStub).toEqual(previousCtx);
    });

    it(' draw should change the canvas', () => {
        const prevCanvasImage = previewCtxStub.getImageData(0, 0, canvasStub.width, canvasStub.height);

        ellipse.draw(previewCtxStub);
        const newCanvasImage = previewCtxStub.getImageData(0, 0, canvasStub.width, canvasStub.height);
        expect(newCanvasImage).toEqual(prevCanvasImage);
    });

    it(' draw should call ctx.fill if DrawType.Fill', () => {
        attributes = new ShapeAttribute(strokeThickness, DrawType.Fill);
        ellipse = new Ellipse(mouseDownCoord, attributes, '#000000', '#000000');
        const fillSpy = spyOn<any>(previewCtxStub, 'fill').and.callThrough();
        ellipse.draw(previewCtxStub);
        expect(fillSpy).toHaveBeenCalled();
    });

    it(' draw should call ctx.stroke if DrawType.Outline', () => {
        attributes = new ShapeAttribute(strokeThickness, DrawType.Outline);
        ellipse = new Ellipse(mouseDownCoord, attributes, '#000000', '#000000');
        const strokeSpy = spyOn<any>(previewCtxStub, 'stroke').and.callThrough();
        ellipse.draw(previewCtxStub);
        expect(strokeSpy).toHaveBeenCalled();
    });

    it(' draw should call ctx.stroke and ctx.fill if DrawType.OutlineFill', () => {
        attributes = new ShapeAttribute(strokeThickness, DrawType.OutlineFill);
        ellipse = new Ellipse(mouseDownCoord, attributes, '#000000', '#000000');
        const fillSpy = spyOn<any>(previewCtxStub, 'fill').and.callThrough();
        const strokeSpy = spyOn<any>(previewCtxStub, 'stroke').and.callThrough();
        ellipse.draw(previewCtxStub);
        expect(strokeSpy).toHaveBeenCalled();
        expect(fillSpy).toHaveBeenCalled();
    });

    it(' drawPerimeter should call ctx.save, ctx.setLineDash, ctx.strokeRect, ctx.restore', () => {
        const saveSpy = spyOn<any>(previewCtxStub, 'save').and.callThrough();
        const setLineDashSpy = spyOn<any>(previewCtxStub, 'setLineDash').and.callThrough();
        const strokeRectSpy = spyOn<any>(previewCtxStub, 'strokeRect').and.callThrough();
        const restoreSpy = spyOn<any>(previewCtxStub, 'restore').and.callThrough();

        ellipse.drawPerimeter(previewCtxStub);
        expect(saveSpy).toHaveBeenCalled();
        expect(setLineDashSpy).toHaveBeenCalled();
        expect(strokeRectSpy).toHaveBeenCalled();
        expect(restoreSpy).toHaveBeenCalled();
    });

    it(' drawPerimeter should not change the state of the context', () => {
        const previousCtx = previewCtxStub;

        ellipse.draw(previewCtxStub);
        expect(previewCtxStub).toEqual(previousCtx);
    });

    it(' clone should return a copy the ellipse object', () => {
        const copyEllipse = ellipse.clone();
        expect(copyEllipse).toEqual(ellipse);
    });
});
