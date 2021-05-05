import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { DrawType } from '@app/constants/draw-type';
// tslint:disable-next-line: no-relative-imports
import { ShapeAttribute } from '../shape-attribute';
import { Stamp } from './stamp';

describe('Stamp', () => {
    // tslint:disable: no-string-literal
    // tslint:disable: no-any
    // tslint:disable: no-magic-numbers
    // reason: Tests (the same reason applies to other tslints in the file)

    let canvasTestHelper: CanvasTestHelper;
    let previewCtxStub: CanvasRenderingContext2D;
    let mouseDownCoord: Vec2;
    let stamp: Stamp;
    let strokeThickness: number;
    let attributes: ShapeAttribute;

    beforeEach(() => {
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        mouseDownCoord = { x: 0, y: 0 };
        strokeThickness = 0.5;
        attributes = new ShapeAttribute(strokeThickness, DrawType.Outline);
        attributes.stampAngle = 50;
        attributes.stampScale = 1.5;
        attributes.stampImage = new Image();

        stamp = new Stamp(mouseDownCoord, attributes);
    });

    it('should be created', () => {
        expect(stamp).toBeTruthy();
    });

    it('draw should call ctx.save,ctx.rotate, ctx.drawImage, ctx.restore', () => {
        const saveSpy = spyOn<any>(previewCtxStub, 'save').and.callThrough();
        const rotateSpy = spyOn<any>(previewCtxStub, 'rotate').and.callThrough();
        const drawImageSpy = spyOn<any>(previewCtxStub, 'drawImage').and.callThrough();
        const restoreSpy = spyOn<any>(previewCtxStub, 'restore').and.callThrough();
        const translateSpy = spyOn<any>(previewCtxStub, 'translate').and.callThrough();
        stamp.mouseDownCoord = { x: 5, y: 5 };
        stamp.draw(previewCtxStub);
        expect(saveSpy).toHaveBeenCalled();
        expect(rotateSpy).toHaveBeenCalled();
        expect(drawImageSpy).toHaveBeenCalled();
        expect(restoreSpy).toHaveBeenCalled();
        expect(translateSpy).toHaveBeenCalled();
    });

    it('updateDimensions should modify stamp dimensions properties', () => {
        stamp.mouseDownCoord = { x: 5, y: 5 };
        const mousePosition = { x: 6, y: 6 };
        stamp.updateDimensions(mousePosition, false);
        expect(stamp.mouseDownCoord.x).toEqual(6);
        expect(stamp.mouseDownCoord.y).toEqual(6);
    });

    it('convertDegreesToRad should return the angle in rad', () => {
        expect(stamp.convertDegreesToRad(50)).toEqual((50 * Math.PI) / 180);
    });
});
