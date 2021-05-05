import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { MINIMUM_HEIGHT, MINIMUM_WIDTH } from '@app/constants/constants';
import { MaterialModule } from '@app/material.module';
import { AutoSaveService } from '@app/services/auto-save/auto-save.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { of } from 'rxjs';
import { MainPageComponent } from './main-page.component';

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let autoSaveServiceSpy: jasmine.SpyObj<AutoSaveService>;
    // tslint:disable:no-any / reason: jasmine spy on function
    let dialogOpenSpy: jasmine.Spy<any>;

    beforeEach(async(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['newCanvasInitialSize']);
        autoSaveServiceSpy = jasmine.createSpyObj('AutoSaveService', [
            'recoverAutoSaveDrawing',
            'isAutoSaveDrawingExists',
            'autoSaveDrawing',
            'clearLocalStorage',
        ]);
        let canvasTestHelper: CanvasTestHelper;

        TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientModule, MaterialModule],
            declarations: [MainPageComponent],
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: AutoSaveService, useValue: autoSaveServiceSpy },
            ],
        }).compileComponents();
        drawingServiceSpy = TestBed.inject(DrawingService) as jasmine.SpyObj<DrawingService>;
        autoSaveServiceSpy = TestBed.inject(AutoSaveService) as jasmine.SpyObj<AutoSaveService>;
        dialogOpenSpy = spyOn<any>(TestBed.inject(MatDialog), 'open').and.callThrough();
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        drawingServiceSpy = TestBed.inject(DrawingService) as jasmine.SpyObj<DrawingService>;
        drawingServiceSpy.canvas = canvasTestHelper.canvas;
        drawingServiceSpy.baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        drawingServiceSpy.previewCtx = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("should have as title 'PolyDessin 2'", () => {
        expect(component.title).toEqual('PolyDessin 2');
    });

    it("createNewDrawing should call drawingService's newCanvasInitialSize if there is not auto saved drawing", () => {
        autoSaveServiceSpy.isAutoSaveDrawingExists.and.callFake(() => {
            return false;
        });
        component.createNewDrawing(MINIMUM_WIDTH, MINIMUM_HEIGHT);
        expect(drawingServiceSpy.newCanvasInitialSize).toHaveBeenCalled();
    });

    it('createNewDrawing should open dialog if there is auto saved drawing and change iscreateNewDrawingDialogOpen to false', () => {
        drawingServiceSpy.isCreateNewDrawingDialogOpen = true;
        dialogOpenSpy.and.returnValue({ afterClosed: () => of(true) });
        autoSaveServiceSpy.isAutoSaveDrawingExists.and.callFake(() => {
            return true;
        });
        component.createNewDrawing(MINIMUM_WIDTH, MINIMUM_HEIGHT);
        expect(dialogOpenSpy).toHaveBeenCalled();
        expect(drawingServiceSpy.isCreateNewDrawingDialogOpen).toBeFalse();
    });

    it('openDrawingsCarouselDialog should open dialog and change isDrawingsCarouselDialogOpen to false', () => {
        drawingServiceSpy.isDrawingsCarouselDialogOpen = true;
        dialogOpenSpy.and.returnValue({ afterClosed: () => of(true) });
        component.openDrawingsCarouselDialog();
        expect(dialogOpenSpy).toHaveBeenCalled();
        expect(drawingServiceSpy.isDrawingsCarouselDialogOpen).toBeFalse();
    });

    it("continueDrawing should call autoSaveService's recoverAutoSaveDrawing", () => {
        component.continueDrawing();
        expect(autoSaveServiceSpy.recoverAutoSaveDrawing).toHaveBeenCalled();
    });

    it("windowInnerWidth should return window's inner width ", () => {
        expect(component.windowInnerWidth).toEqual(window.innerWidth);
    });

    it("windowInnerHeight should return window's inner height ", () => {
        expect(component.windowInnerHeight).toEqual(window.innerHeight);
    });
});
