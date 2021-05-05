import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { IMAGE_LOADING_TIME } from '@app/constants/constants';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { AutoSaveService } from './auto-save.service';

describe('AutoSaveService', () => {
    let service: AutoSaveService;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    // tslint:disable-next-line: prefer-const reason : test
    let canvasTestHelper: CanvasTestHelper;

    beforeEach(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['isCanvasEmpty', 'clearCanvas', 'updateUndoRedoActions']);
        TestBed.configureTestingModule({
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        });
        service = TestBed.inject(AutoSaveService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        drawingServiceSpy = TestBed.inject(DrawingService) as jasmine.SpyObj<DrawingService>;
        drawingServiceSpy.canvas = canvasTestHelper.canvas;
        drawingServiceSpy.baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        drawingServiceSpy.previewCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it("clearLocalStorage should call localStorage's clear", () => {
        const clearStorageSpy = spyOn(Object.getPrototypeOf(localStorage), 'clear');
        service.clearLocalStorage();
        expect(clearStorageSpy).toHaveBeenCalled();
    });

    it("autoSaveDrawing should call clearLocalStorage when drawingService' isCanvasEmpty return true", () => {
        drawingServiceSpy.isCanvasEmpty.and.returnValue(true);
        const clearLocalStorageSpy = spyOn(service, 'clearLocalStorage');
        service.autoSaveDrawing();
        expect(clearLocalStorageSpy).toHaveBeenCalled();
    });

    it("autoSaveDrawing should call call localStorage's setItem when drawingService' isCanvasEmpty return false", () => {
        drawingServiceSpy.isCanvasEmpty.and.returnValue(false);
        const localStorageSpy = spyOn(Object.getPrototypeOf(localStorage), 'setItem');
        service.autoSaveDrawing();
        expect(localStorageSpy).toHaveBeenCalled();
    });

    it("recoverAutoSaveDrawing should call drawingService's clearCanvas and ctx drawImage when recovering auto saved drawing", (done) => {
        const baseDrawImageSpy = spyOn(drawingServiceSpy.baseCtx, 'drawImage');
        const previewDrawImageSpy = spyOn(drawingServiceSpy.previewCtx, 'drawImage');
        const canvasSizeTester: Vec2 = { x: 250, y: 250 };
        drawingServiceSpy.canvasSize = canvasSizeTester;
        drawingServiceSpy.isCanvasEmpty.and.returnValue(false);
        service.autoSaveDrawing();
        service.recoverAutoSaveDrawing();
        setTimeout(() => {
            expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
            expect(baseDrawImageSpy).toHaveBeenCalled();
            expect(previewDrawImageSpy).toHaveBeenCalled();
            expect(drawingServiceSpy.updateUndoRedoActions).toHaveBeenCalled();
            done();
        }, IMAGE_LOADING_TIME);
    });

    it('isAutoSaveDrawingExists should return false if there is not an auto saved drawing in localStorage', () => {
        service.clearLocalStorage();
        expect(service.isAutoSaveDrawingExists()).toEqual(false);
    });

    it('isAutoSaveDrawingExists should return true if there is an auto saved drawing in localStorage', () => {
        service.autoSaveDrawing();
        expect(service.isAutoSaveDrawingExists()).toEqual(true);
    });
});
