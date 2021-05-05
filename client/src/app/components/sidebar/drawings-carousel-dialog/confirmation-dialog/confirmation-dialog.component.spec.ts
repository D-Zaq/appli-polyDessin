import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { IMAGE_LOADING_TIME } from '@app/constants/constants';
import { MaterialModule } from '@app/material.module';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';

describe('ConfirmationDialogComponent', () => {
    let component: ConfirmationDialogComponent;
    let fixture: ComponentFixture<ConfirmationDialogComponent>;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtx: CanvasRenderingContext2D;
    let previewCtx: CanvasRenderingContext2D;
    const mockDialog = {
        closeAll: jasmine.createSpy('closeAll'),
    };
    beforeEach(async(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'updateUndoRedoActions']);

        TestBed.configureTestingModule({
            imports: [MaterialModule],
            declarations: [ConfirmationDialogComponent],
            providers: [
                { provide: MatDialog, useValue: mockDialog },
                { provide: MAT_DIALOG_DATA, useValue: [] },
                { provide: DrawingService, useValue: drawingServiceSpy },
            ],
        }).compileComponents();
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        drawingServiceSpy.canvas = canvasTestHelper.canvas;
        baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        drawingServiceSpy.baseCtx = baseCtx;
        drawingServiceSpy.previewCtx = previewCtx;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfirmationDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("openDrawing should call drawingService's clearCanvas and drawImage and close dialog if canvas empty", (done) => {
        const drawImageSpy = spyOn(drawingServiceSpy.baseCtx, 'drawImage');
        const canvasSizeTester: Vec2 = { x: 250, y: 250 };
        drawingServiceSpy.canvasSize = canvasSizeTester;
        component.data = { drawingData: { name: 'test', tags: [], _id: 'test', url: drawingServiceSpy.canvas.toDataURL() } };
        component.openDrawing();
        setTimeout(() => {
            expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
            expect(drawImageSpy).toHaveBeenCalledTimes(2);
            expect(mockDialog.closeAll).toHaveBeenCalled();
            expect(drawingServiceSpy.updateUndoRedoActions).toHaveBeenCalled();
            done();
        }, IMAGE_LOADING_TIME);
    });
});
