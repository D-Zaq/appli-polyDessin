// import { Vec2 } from '@app/classes/vec2';
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { AttributeEditorService } from '@app/services/attribute-editor/attribute-editor.service';
import { Line } from './line';

describe('Line', () => {
    let component: Line;
    let canvasTestHelper: CanvasTestHelper;
    let previewCtxStub: CanvasRenderingContext2D;
    let attributeEditorService: AttributeEditorService;
    let canvasStub: HTMLCanvasElement;
    const primaryColor = '#000000';
    const secondaryColor = '#000000';
    beforeEach(() => {
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        attributeEditorService = new AttributeEditorService();

        // const mouseInit: Vec2 = { x: 0, y: 0 };
        component = new Line(true, attributeEditorService.attributes, primaryColor, secondaryColor);
        canvasStub = canvasTestHelper.canvas;
    });

    it('should be created', () => {
        expect(component).toBeTruthy();
    });
    it(' draw should not change the state of the context', () => {
        const previousCtx = previewCtxStub;

        component.draw(previewCtxStub);
        expect(previewCtxStub).toEqual(previousCtx);
    });

    it(' draw should change the canvas', () => {
        const newData: Vec2 = { x: 1, y: 1 };
        component.pathData.push(newData);
        const prevCanvasImage = previewCtxStub.getImageData(0, 0, canvasStub.width, canvasStub.height);

        component.draw(previewCtxStub);
        const newCanvasImage = previewCtxStub.getImageData(0, 0, canvasStub.width, canvasStub.height);
        expect(newCanvasImage).toEqual(prevCanvasImage);
    });
    it(' draw should tke junctionpoint', () => {
        component = new Line(false, attributeEditorService.attributes, primaryColor, secondaryColor);

        const prevCanvasImage = previewCtxStub.getImageData(0, 0, canvasStub.width, canvasStub.height);

        component.draw(previewCtxStub);
        const newCanvasImage = previewCtxStub.getImageData(0, 0, canvasStub.width, canvasStub.height);
        expect(newCanvasImage).toEqual(prevCanvasImage);
    });
    it(' delete should delete and then draw', () => {
        const prevCanvasImage = previewCtxStub.getImageData(0, 0, canvasStub.width, canvasStub.height);

        component.delete(previewCtxStub);
        const newCanvasImage = previewCtxStub.getImageData(0, 0, canvasStub.width, canvasStub.height);
        expect(newCanvasImage).toEqual(prevCanvasImage);
    });
    it(' closeDrawing should change ctx', () => {
        const prevCanvasImage = previewCtxStub.getImageData(0, 0, canvasStub.width, canvasStub.height);
        component.closeDrawing(previewCtxStub);
        component.draw(previewCtxStub);
        const newCanvasImage = previewCtxStub.getImageData(0, 0, canvasStub.width, canvasStub.height);
        expect(newCanvasImage).toEqual(prevCanvasImage);
    });
    it(' calculateDistance should returnDistance', () => {
        const newData: Vec2 = { x: 0, y: 1 };
        const newData2: Vec2 = { x: 1, y: 1 };
        expect(component.calculateDistance(newData, newData2)).toBe(1);
    });
    it(' setJunctionPoint set', () => {
        component.junctionPoint = false;
        component.setJunctionPoint(true);
        expect(component.junctionPoint).toBe(true);
    });
    it(' get path data returns pathdata', () => {
        component.pathData = new Array();
        const newData: Vec2 = { x: 1, y: 1 };
        component.pathData.push(newData);
        expect(component.getPathData()[0]).toEqual(newData);
    });
});
