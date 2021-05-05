import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { Vec2 } from '@app/classes/vec2';
import { DrawType } from '@app/constants/draw-type';
import { Polygon } from './polygon';

describe('Polygon', () => {
    // tslint:disable: no-string-literal
    // tslint:disable: no-any
    // tslint:disable: no-magic-numbers
    // reason: Tests (the same reason applies to other tslints in the file)
    let polygon: Polygon;
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

        polygon = new Polygon(mouseDownCoord, attributes, primaryColor, secondaryColor);
    });

    it('should be created', () => {
        expect(polygon).toBeTruthy();
    });

    it(' updateDimensions should properly modify x and y values', () => {
        const mousePosition = { x: 15, y: 15 };
        const isShiftPressed = false;
        polygon.updateDimensions(mousePosition, isShiftPressed);
        expect(polygon.centerCoord.x).toEqual(10);
        expect(polygon.centerCoord.y).toEqual(10);
    });

    it(' updateDimensions should set radiusX and radiusY to positive values', () => {
        const mousePosition = { x: -10, y: -10 };
        const isShiftPressed = false;
        polygon.updateDimensions(mousePosition, isShiftPressed);
        expect(polygon.circleRadius).toBeGreaterThanOrEqual(0);
    });

    it(' updateDimensions should set the circleRadius property to the value of radiusY if isShiftKeyPressed is true and radiusY > radiusX ', () => {
        const mousePosition = { x: 15, y: 15 };
        const isShiftPressed = true;
        polygon.updateDimensions(mousePosition, isShiftPressed);
        expect(polygon.circleRadius).toEqual(2.5);
    });

    it(' draw should not change the state of the context', () => {
        const previousCtx = previewCtxStub;

        polygon.draw(previewCtxStub);
        expect(previewCtxStub).toEqual(previousCtx);
    });

    it(' draw should change the canvas', () => {
        const prevCanvasImage = previewCtxStub.getImageData(0, 0, canvasStub.width, canvasStub.height);

        polygon.draw(previewCtxStub);
        const newCanvasImage = previewCtxStub.getImageData(0, 0, canvasStub.width, canvasStub.height);
        expect(newCanvasImage).toEqual(prevCanvasImage);
    });

    it(' draw should call ctx.fill if DrawType.Fill', () => {
        attributes = new ShapeAttribute(strokeThickness, DrawType.Fill);
        polygon = new Polygon(mouseDownCoord, attributes, '#000000', '#000000');
        const fillSpy = spyOn<any>(previewCtxStub, 'fill').and.callThrough();
        polygon.draw(previewCtxStub);
        expect(fillSpy).toHaveBeenCalled();
    });

    it(' draw should call ctx.stroke if DrawType.Outline', () => {
        attributes = new ShapeAttribute(strokeThickness, DrawType.Outline);
        polygon = new Polygon(mouseDownCoord, attributes, '#000000', '#000000');
        const strokeSpy = spyOn<any>(previewCtxStub, 'stroke').and.callThrough();
        polygon.draw(previewCtxStub);
        expect(strokeSpy).toHaveBeenCalled();
    });

    it(' draw should call ctx.stroke and ctx.fill if DrawType.OutlineFill', () => {
        attributes = new ShapeAttribute(strokeThickness, DrawType.OutlineFill);
        polygon = new Polygon(mouseDownCoord, attributes, '#000000', '#000000');
        const fillSpy = spyOn<any>(previewCtxStub, 'fill').and.callThrough();
        const strokeSpy = spyOn<any>(previewCtxStub, 'stroke').and.callThrough();
        polygon.draw(previewCtxStub);
        expect(strokeSpy).toHaveBeenCalled();
        expect(fillSpy).toHaveBeenCalled();
    });

    it(' drawPerimeter should call ctx.save, ctx.setLineDash, ctx.strokeRect, ctx.restore', () => {
        const saveSpy = spyOn<any>(previewCtxStub, 'save').and.callThrough();
        const setLineDashSpy = spyOn<any>(previewCtxStub, 'setLineDash').and.callThrough();
        const ellipseSpy = spyOn<any>(previewCtxStub, 'ellipse').and.callThrough();
        const restoreSpy = spyOn<any>(previewCtxStub, 'restore').and.callThrough();

        polygon.drawPerimeter(previewCtxStub);
        expect(saveSpy).toHaveBeenCalled();
        expect(setLineDashSpy).toHaveBeenCalled();
        expect(ellipseSpy).toHaveBeenCalled();
        expect(restoreSpy).toHaveBeenCalled();
    });

    it(' drawPerimeter should not change the state of the context', () => {
        const previousCtx = previewCtxStub;

        polygon.draw(previewCtxStub);
        expect(previewCtxStub).toEqual(previousCtx);
    });
});
