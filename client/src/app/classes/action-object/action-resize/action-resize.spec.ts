import { TestBed } from '@angular/core/testing';
import { ActionResize } from '@app/classes/action-object/action-resize/action-resize';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { IMAGE_LOADING_TIME } from '@app/constants/constants';
import { DrawingService } from '@app/services/drawing/drawing.service';

describe('ActionResize', () => {
    // tslint:disable: no-string-literal
    // tslint:disable: no-any
    // tslint:disable: no-magic-numbers
    // reason: Tests (the same reason applies to other tslints in the file)
    let actionResize: ActionResize;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let canvasStub: HTMLCanvasElement;
    let canvasWidth: number;
    let canvasHeight: number;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'getPrimaryColor', 'getSecondaryColor']);

        TestBed.configureTestingModule({
            providers: [{ provides: 'DrawingService', useValue: drawServiceSpy }],
        });

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        canvasWidth = canvasTestHelper.canvas.width;
        canvasHeight = canvasTestHelper.canvas.height;
        canvasStub = canvasTestHelper.canvas;
        drawServiceSpy.canvasSize = { x: 0, y: 0 };
        drawServiceSpy.canvas = canvasStub;
        drawServiceSpy.baseCtx = baseCtxStub;
        drawServiceSpy.previewCtx = previewCtxStub;

        actionResize = new ActionResize(canvasWidth, canvasHeight);
    });

    it('should be created', () => {
        expect(actionResize).toBeTruthy();
    });

    it('execute should call modify width and height of baseCtx, previewCtx and canvasSize', (done) => {
        const toDataURLSpy = spyOn<any>(drawServiceSpy.canvas, 'toDataURL').and.callThrough();
        const baseCtxDrawImageSpy = spyOn<any>(drawServiceSpy.baseCtx, 'drawImage').and.callThrough();
        const previewCtxDrawImageSpy = spyOn<any>(drawServiceSpy.previewCtx, 'drawImage').and.callThrough();
        actionResize.execute(drawServiceSpy);
        expect(toDataURLSpy).toHaveBeenCalled();
        setTimeout(() => {
            expect(baseCtxDrawImageSpy).toHaveBeenCalled();
            expect(previewCtxDrawImageSpy).toHaveBeenCalled();
            done();
        }, IMAGE_LOADING_TIME);
    });
});
