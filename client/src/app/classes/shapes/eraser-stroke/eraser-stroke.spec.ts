import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { AttributeEditorService } from '@app/services/attribute-editor/attribute-editor.service';
import { EraserStroke } from './eraser-stroke';

describe('EraserStroke', () => {
    let eraser: EraserStroke;
    let canvasTestHelper: CanvasTestHelper;
    let previewCtxStub: CanvasRenderingContext2D;
    let canvasStub: HTMLCanvasElement;
    let attributeEditorService: AttributeEditorService;
    let primaryColor: string;
    let secondaryColor: string;

    beforeEach(() => {
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        canvasStub = canvasTestHelper.canvas;
        attributeEditorService = new AttributeEditorService();
        primaryColor = '#000000';
        secondaryColor = '#000000';
        eraser = new EraserStroke(attributeEditorService.attributes, primaryColor, secondaryColor);
    });

    it('should be created', () => {
        expect(eraser).toBeTruthy();
    });

    it(' updatePositionEraser should set x and y properties', () => {
        // tslint:disable: no-magic-numbers // Reason: test
        eraser.attributes.strokeThickness = 10;
        const mousePosition = { x: 20, y: 20 };
        eraser.updatePositionEraser(mousePosition);
        expect(eraser.x).toEqual(15);
        expect(eraser.y).toEqual(15);
    });

    it(' draw should not change the state of the context', () => {
        const previousCtx = previewCtxStub;

        eraser.draw(previewCtxStub);
        expect(previewCtxStub).toEqual(previousCtx);
    });

    it(' draw should change the canvas', () => {
        const prevCanvasImage = previewCtxStub.getImageData(0, 0, canvasStub.width, canvasStub.height);

        const mousePosition: Vec2 = { x: 0, y: 0 };
        eraser.updateStroke(mousePosition);
        eraser.draw(previewCtxStub);
        const newCanvasImage = previewCtxStub.getImageData(0, 0, canvasStub.width, canvasStub.height);
        expect(newCanvasImage).not.toEqual(prevCanvasImage);
    });

    it(' drawPerimeter should not change the state of the context', () => {
        const previousCtx = previewCtxStub;
        eraser.draw(previewCtxStub);
        expect(previewCtxStub).toEqual(previousCtx);
    });

    it(' drawPerimeter should change the canvas', () => {
        const prevCanvasImage = previewCtxStub.getImageData(0, 0, canvasStub.width, canvasStub.height);
        eraser.drawPerimeter(previewCtxStub);
        const newCanvasImage = previewCtxStub.getImageData(0, 0, canvasStub.width, canvasStub.height);
        expect(newCanvasImage).not.toEqual(prevCanvasImage);
    });
});
