import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MINIMUM_HEIGHT, MINIMUM_WIDTH } from '@app/constants/constants';
import { MaterialModule } from '@app/material.module';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { CreateNewDrawingDialogComponent } from './create-new-drawing-dialog.component';

describe('CreateNewDrawingDialogComponent', () => {
    let component: CreateNewDrawingDialogComponent;
    let fixture: ComponentFixture<CreateNewDrawingDialogComponent>;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;

    beforeEach(async(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'newCanvasInitialSize']);
        TestBed.configureTestingModule({
            imports: [MaterialModule],
            declarations: [CreateNewDrawingDialogComponent],
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        }).compileComponents();
        drawingServiceSpy = TestBed.inject(DrawingService) as jasmine.SpyObj<DrawingService>;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CreateNewDrawingDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("should call the drawingService's clearCanvas  and newCanvasInitialSize", () => {
        component.clearCanvas(MINIMUM_WIDTH, MINIMUM_HEIGHT);
        expect(drawingServiceSpy.clearCanvas).toHaveBeenCalledWith(drawingServiceSpy.previewCtx);
        expect(drawingServiceSpy.newCanvasInitialSize).toHaveBeenCalled();
    });

    it("windowInnerWidth should return window's inner width ", () => {
        expect(component.windowInnerWidth).toEqual(window.innerWidth);
    });

    it("windowInnerHeight should return window's inner height ", () => {
        expect(component.windowInnerHeight).toEqual(window.innerHeight);
    });
});
