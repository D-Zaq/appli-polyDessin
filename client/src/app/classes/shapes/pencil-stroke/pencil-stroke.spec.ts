import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { AttributeEditorService } from '@app/services/attribute-editor/attribute-editor.service';
import { PencilStroke } from './pencil-stroke';

describe('PencilStroke', () => {
    let pencil: PencilStroke;
    let canvasTestHelper: CanvasTestHelper;
    let previewCtxStub: CanvasRenderingContext2D;
    let canvasStub: HTMLCanvasElement;
    let attributeEditorService: AttributeEditorService;

    beforeEach(() => {
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        canvasStub = canvasTestHelper.canvas;
        attributeEditorService = new AttributeEditorService();
        const primaryColor = '#000000';
        const secondaryColor = '#000000';
        pencil = new PencilStroke(attributeEditorService.attributes, primaryColor, secondaryColor);
    });

    it('should be created', () => {
        expect(pencil).toBeTruthy();
    });

    it(' updateStroke should populate pathData array property', () => {
        const mousePosition: Vec2 = { x: 5, y: 5 };
        pencil.updateStroke(mousePosition);
        // tslint:disable-next-line: no-string-literal // reason: test
        expect(pencil['pathData'].length).toEqual(1);
    });

    it(' draw should not change the state of the context', () => {
        const previousCtx = previewCtxStub;
        pencil.draw(previewCtxStub);
        expect(previewCtxStub).toEqual(previousCtx);
    });

    it(' draw should change the canvas', () => {
        const prevCanvasImage = previewCtxStub.getImageData(0, 0, canvasStub.width, canvasStub.height);
        pencil.draw(previewCtxStub);
        const newCanvasImage = previewCtxStub.getImageData(0, 0, canvasStub.width, canvasStub.height);
        expect(newCanvasImage).toEqual(prevCanvasImage);
    });
});
