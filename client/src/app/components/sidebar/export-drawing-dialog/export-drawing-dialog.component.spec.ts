import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { MaterialModule } from '@app/material.module';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ExportDrawingDialogComponent } from './export-drawing-dialog.component';

describe('ExportDrawingDialogComponent', () => {
    let component: ExportDrawingDialogComponent;
    let fixture: ComponentFixture<ExportDrawingDialogComponent>;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let canvasTestHelper: CanvasTestHelper;
    const mockDialogRef = {
        close: jasmine.createSpy('close'),
    };

    beforeEach(async(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        TestBed.configureTestingModule({
            imports: [MaterialModule, HttpClientTestingModule],
            declarations: [ExportDrawingDialogComponent],
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: MatDialogRef, useValue: mockDialogRef },
            ],
        }).compileComponents();
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        drawingServiceSpy = TestBed.inject(DrawingService) as jasmine.SpyObj<DrawingService>;
        drawingServiceSpy.canvas = canvasTestHelper.canvas;
        drawingServiceSpy.baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ExportDrawingDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("applyFilter should set imageCtx's filter to none if imageFilter is none and call drawFilterPreviewCanvas", () => {
        component.imageCtx.filter = 'invert(100%)';
        component.imageFilter = 'none';
        const drawFilterPreviewCanvasSpy = spyOn(component, 'drawFilterPreviewCanvas').and.callThrough();
        component.applyFilter();
        expect(component.imageCtx.filter).toEqual('none');
        expect(drawFilterPreviewCanvasSpy).toHaveBeenCalled();
    });

    it("applyFilter should set imageCtx's filter to inverted if imageFilter is invert", () => {
        component.imageFilter = 'invert';
        component.imageCtx.filter = 'none';
        component.applyFilter();
        expect(component.imageCtx.filter).toEqual('invert(100%)');
    });
    it("applyFilter should set imageCtx's filter to inverted if imageFilter is invert", () => {
        component.imageFilter = 'invert';
        component.imageCtx.filter = 'none';
        component.applyFilter();
        expect(component.imageCtx.filter).toEqual('invert(100%)');
    });
    it("applyFilter should set imageCtx's filter to grayscale if imageFilter is grayscale", () => {
        component.imageFilter = 'grayscale';
        component.imageCtx.filter = 'none';
        component.applyFilter();
        expect(component.imageCtx.filter).toEqual('grayscale(100%)');
    });
    it("applyFilter should set imageCtx's filter to saturated if imageFilter is saturate", () => {
        component.imageFilter = 'saturate';
        component.imageCtx.filter = 'none';
        component.applyFilter();
        expect(component.imageCtx.filter).toEqual('saturate(200%)');
    });
    it("applyFilter should set imageCtx's filter to opacity if imageFilter is opacity", () => {
        component.imageFilter = 'opacity';
        component.imageCtx.filter = 'none';
        component.applyFilter();
        expect(component.imageCtx.filter).toEqual('opacity(50%)');
    });
    it("applyFilter should set imageCtx's filter to drop-shadow if imageFilter is drop-shadow", () => {
        component.imageFilter = 'drop-shadow';
        component.imageCtx.filter = 'none';
        component.applyFilter();
        expect(component.imageCtx.filter).toEqual('drop-shadow(16px 16px 10px black)');
    });

    it('applyFilter should call drawImage and fillCanvasWithWhiteBackgroundColor', () => {
        const fillCanvasWithWhiteBackgroundColorSpy = spyOn(component, 'fillCanvasWithWhiteBackgroundColor').and.callThrough();
        const drawImageSpy = spyOn(component.imageCtx, 'drawImage').and.callThrough();
        component.applyFilter();
        expect(fillCanvasWithWhiteBackgroundColorSpy).toHaveBeenCalledWith();
        expect(drawImageSpy).toHaveBeenCalled();
    });

    it('fillCanvasWithWhiteBackgroundColor should fill canvas with white', () => {
        component.imageCtx.fillStyle = '#000000';
        component.imageCtx.fillRect(0, 0, component.imageCtx.canvas.width, component.imageCtx.canvas.height);
        component.fillCanvasWithWhiteBackgroundColor();
        const imageData = component.imageCtx.getImageData(0, 0, 1, 1);
        // tslint:disable-next-line: no-magic-numbers reason: test
        expect(imageData.data[0]).toEqual(255);
    });

    it('exportImage should call fillCanvasWithWhiteBackgroundColor, drawImage, reset filter, set image url, export image and close dialog', () => {
        component.imageContainer.nativeElement.href = '';
        const fillCanvasWithWhiteBackgroundColorSpy = spyOn(component, 'fillCanvasWithWhiteBackgroundColor');
        const drawImageSpy = spyOn(component.imageCtx, 'drawImage');
        const exportClickSpy = spyOn(component.imageContainer.nativeElement, 'click').and.callFake(() => {
            return;
        });
        component.exportImage();
        expect(fillCanvasWithWhiteBackgroundColorSpy).toHaveBeenCalled();
        expect(drawImageSpy).toHaveBeenCalled();
        expect(component.imageCtx.filter).toEqual('none');
        expect(component.imageContainer.nativeElement.href).not.toEqual('');
        expect(exportClickSpy).toHaveBeenCalled();
        expect(mockDialogRef.close).toHaveBeenCalled();
    });

    it('imgurExportImage should call fillCanvasWithWhiteBackgroundColor, drawImage, reset filter, set image url', () => {
        component.imageContainer.nativeElement.href = '';
        const fillCanvasWithWhiteBackgroundColorSpy = spyOn(component, 'fillCanvasWithWhiteBackgroundColor');
        const drawImageSpy = spyOn(component.imageCtx, 'drawImage');
        component.imgurExportImage();
        expect(fillCanvasWithWhiteBackgroundColorSpy).toHaveBeenCalled();
        expect(drawImageSpy).toHaveBeenCalled();
        expect(component.imageCtx.filter).toEqual('none');
        expect(component.imageContainer.nativeElement.href).not.toEqual('');
        expect(component.isImgurExportSucces).toEqual(true);
    });
});
