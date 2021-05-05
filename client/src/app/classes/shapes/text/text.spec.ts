import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { Vec2 } from '@app/classes/vec2';
import { DrawType } from '@app/constants/draw-type';
import { Text } from './text';

describe('Rectangle', () => {
    // tslint:disable: no-string-literal
    // tslint:disable: no-any
    // reason: Testing purposes
    let text: Text;
    let canvasTestHelper: CanvasTestHelper;
    let previewCtxStub: CanvasRenderingContext2D;
    let mouseDownCoord: Vec2;
    let strokeThickness: number;
    let attributes: ShapeAttribute;

    beforeEach(() => {
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        mouseDownCoord = { x: 0, y: 0 };
        strokeThickness = 1 / 2;
        attributes = new ShapeAttribute(strokeThickness, DrawType.Outline);
        const primaryColor = '#000000';
        const secondaryColor = '#000000';
        const testArray = new Array();
        const testString = 'test';
        testArray[0] = testString;

        text = new Text(mouseDownCoord, attributes, primaryColor, secondaryColor, 1, true, true, 'arial', 'left', testArray);
    });

    it('should be created', () => {
        expect(text).toBeTruthy();
    });
    it('draw should drawOncanvas', () => {
        const ctxCopy = previewCtxStub;
        text.draw(previewCtxStub);
        expect(ctxCopy).toEqual(previewCtxStub);
    });
    it('drawPreview should draw preview', () => {
        const ctxCopy = previewCtxStub;
        text.drawPreview(previewCtxStub);
        expect(ctxCopy).toEqual(previewCtxStub);
    });
    it('applyToCanvas should apply correctly', () => {
        const ctxCopy = previewCtxStub;
        text.applyToCanvas(previewCtxStub);
        expect(ctxCopy).toEqual(previewCtxStub);
    });
});
