import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { AttributeEditorService } from '@app/services/attribute-editor/attribute-editor.service';
import { Paintbucket } from './paintbucket';

describe('Paintbucket', () => {
    let paintbucket: Paintbucket;
    let canvasTestHelper: CanvasTestHelper;
    let previewCtxStub: CanvasRenderingContext2D;
    let attributeEditorService: AttributeEditorService;

    beforeEach(() => {
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        attributeEditorService = new AttributeEditorService();
        const primaryColor = '#000000';
        const secondaryColor = '#000000';
        const mouseInit: Vec2 = { x: 0, y: 0 };
        paintbucket = new Paintbucket(mouseInit, attributeEditorService.attributes, primaryColor, secondaryColor);
    });

    it('should be created', () => {
        expect(paintbucket).toBeTruthy();
    });
    it('sendVec2array should change array of Vec2', () => {
        const comparisonArray: Vec2[] = paintbucket.similarColorPixels;
        const differentPixel: Vec2 = { x: 1, y: 0 };
        const comparisonArray2 = new Array();
        comparisonArray2.push(differentPixel);
        paintbucket.similarColorPixels = comparisonArray2;
        paintbucket.sendVec2Array(comparisonArray2);
        expect(paintbucket.similarColorPixels).not.toEqual(comparisonArray);
    });
    it('draw should draw on canvas', () => {
        const ctxCopy = previewCtxStub.canvas;
        const differentPixel: Vec2 = { x: 1, y: 0 };
        const comparisonArray2 = new Array();
        comparisonArray2.push(differentPixel);
        paintbucket.similarColorPixels = comparisonArray2;
        paintbucket.draw(previewCtxStub);
        expect(previewCtxStub.canvas).toEqual(ctxCopy);
    });
});
