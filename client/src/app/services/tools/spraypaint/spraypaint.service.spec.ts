import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { AbsShape } from '@app/classes/shapes/shape';
import { Spraypaint } from '@app/classes/shapes/spraypaint/spraypaint';
import { MouseButton } from '@app/constants/mouse-button';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SpraypaintService } from './spraypaint.service';

describe('SpraypaintService', () => {
    let service: SpraypaintService;
    let spraypaintSpy: jasmine.SpyObj<Spraypaint>;
    let mouseEventLClick: MouseEvent;
    let mouseEventRClick: MouseEvent;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let canvasStub: HTMLCanvasElement;
    mouseEventLClick = {
        offsetX: 25,
        offsetY: 25,
        x: 25,
        y: 25,
        button: MouseButton.Left,
    } as MouseEvent;
    mouseEventRClick = {
        offsetX: 25,
        offsetY: 25,
        button: MouseButton.Right,
    } as MouseEvent;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'getPrimaryColor', 'getSecondaryColor']);
        spraypaintSpy = jasmine.createSpyObj('Spaypaint', ['draw', 'updateDraw', 'updateStroke', 'clearDraw']);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: Spraypaint, useValue: spraypaintSpy },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);

        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        service = TestBed.inject(SpraypaintService);
        // tslint:disable:no-string-literal // Jasmine doesnt copy properties with underlying data
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].canvas = canvasStub;
        service['shape'] = spraypaintSpy;
        canvasStub = canvasTestHelper.canvas;
    });
    it('should be created', () => {
        expect(service).toBeTruthy();
    });
    it('onmouseDown should change attributes if mouse down is true', () => {
        service.onMouseDown(mouseEventLClick);
        expect(service.mouseDown).toBe(true);
        expect(service.mouseDownCoord.x).toBe(mouseEventLClick.offsetX);
        expect(service.mouseDownCoord.y).toBe(mouseEventLClick.offsetY);
    });
    it('onmouseDown should not make new shape', () => {
        const oldShape: AbsShape = service.getShape();
        service.onMouseDown(mouseEventRClick);
        expect(service.getShape() !== oldShape).toBe(false);
    });
    it('onmouseDown should make new shape', () => {
        const oldShape: AbsShape = service.getShape();
        service.onMouseDown(mouseEventLClick);
        expect(service.getShape() !== oldShape).toBe(true);
    });
    it('onmouseMove should do nothing if mouseDown is false ', () => {
        service.mouseDown = false;
        service.onMouseMove(mouseEventRClick);
        expect(spraypaintSpy.updateStroke).not.toHaveBeenCalled();
    });
    it('onmouseMove should update storke if mouseDown is true ', () => {
        service.mouseDown = true;
        service.onMouseMove(mouseEventRClick);
        expect(spraypaintSpy.updateStroke).toHaveBeenCalled();
    });
    // it('onmouseUp should not clear canvas if mouse is not down ', () => {
    //     service.mouseDown = false;
    //     service.onMouseUp(mouseEventRClick);
    //     expect(drawServiceSpy.clearCanvas).not.toHaveBeenCalled();
    // });
    // it('onmouseUp should clear canvas if mouse is down ', () => {
    //     service.mouseDown = true;
    //     service.onMouseUp(mouseEventRClick);
    //     expect(drawServiceSpy.clearCanvas).toHaveBeenCalled();
    // });
});
