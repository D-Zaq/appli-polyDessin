import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { CREATED_HTTP_STATUS, NO_CONTENT_HTTP_STATUS } from '@app/constants/constants';
import { MaterialModule } from '@app/material.module';
import { DatabaseService } from '@app/services/database/database.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { of } from 'rxjs';
import { SaveDrawingDialogComponent } from './save-drawing-dialog.component';

describe('SaveDrawingDialogComponent', () => {
    let component: SaveDrawingDialogComponent;
    let fixture: ComponentFixture<SaveDrawingDialogComponent>;
    const mockDialogRef = {
        close: jasmine.createSpy('close'),
    };
    const mockSnackbar = {
        open: jasmine.createSpy('open'),
    };
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let databaseServiceSpy: jasmine.SpyObj<DatabaseService>;
    let canvasTestHelper: CanvasTestHelper;

    beforeEach(async(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        databaseServiceSpy = jasmine.createSpyObj('DatabaseService', ['sendDrawing']);
        TestBed.configureTestingModule({
            imports: [MaterialModule],
            declarations: [SaveDrawingDialogComponent],
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: MatDialogRef, useValue: mockDialogRef },
                { provide: DatabaseService, useValue: databaseServiceSpy },
                { provide: MatSnackBar, useValue: mockSnackbar },
            ],
        }).compileComponents();
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        drawingServiceSpy = TestBed.inject(DrawingService) as jasmine.SpyObj<DrawingService>;
        drawingServiceSpy.canvas = canvasTestHelper.canvas;
        drawingServiceSpy.baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SaveDrawingDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('openSnackBar should open snackbar', () => {
        const testMessage = 'testing';
        const testaction = 'test';
        const testType = 'testing-snackbar';
        component.openSnackBar(testMessage, testaction, testType);
        expect(mockSnackbar.open).toHaveBeenCalled();
    });

    it("saveImage should call fillCanvasWithWhiteBackgroundColor, drawImage, databaseService's sendDrawing , open success green-snackbar and set isBeingSaved to false ", () => {
        component.isBeingSaved = true;
        const fillCanvasWithWhiteBackgroundColorSpy = spyOn(component, 'fillCanvasWithWhiteBackgroundColor');
        const drawImageSpy = spyOn(component.imageCtx, 'drawImage');
        const openSnackBarSpy = spyOn(component, 'openSnackBar');
        databaseServiceSpy.sendDrawing.and.returnValue(of(CREATED_HTTP_STATUS));
        component.saveImage();
        expect(fillCanvasWithWhiteBackgroundColorSpy).toHaveBeenCalled();
        expect(drawImageSpy).toHaveBeenCalled();
        expect(databaseServiceSpy.sendDrawing).toHaveBeenCalled();
        expect(openSnackBarSpy).toHaveBeenCalledWith('votre dessin a été sauvegardé avec succès', 'Fermer', 'green-snackbar');
        expect(component.isBeingSaved).toBeFalse();
    });

    it("saveImage should call fillCanvasWithWhiteBackgroundColor, drawImage, databaseService's sendDrawing , open error red-snackbar and set isBeingSaved to false ", () => {
        component.isBeingSaved = true;
        const fillCanvasWithWhiteBackgroundColorSpy = spyOn(component, 'fillCanvasWithWhiteBackgroundColor');
        const drawImageSpy = spyOn(component.imageCtx, 'drawImage');
        const openSnackBarSpy = spyOn(component, 'openSnackBar');
        databaseServiceSpy.sendDrawing.and.returnValue(of(NO_CONTENT_HTTP_STATUS));
        component.saveImage();
        expect(fillCanvasWithWhiteBackgroundColorSpy).toHaveBeenCalled();
        expect(drawImageSpy).toHaveBeenCalled();
        expect(databaseServiceSpy.sendDrawing).toHaveBeenCalled();
        expect(openSnackBarSpy).toHaveBeenCalledWith('le serveur est actuellement indisponible', 'Fermer', 'red-snackbar');
        expect(component.isBeingSaved).toBeFalse();
    });

    it('addTag should add the tag and call filterCarrouselImagesWithTags when tag form is valid', () => {
        const htmlInput: HTMLInputElement = document.createElement('input');
        const event: MatChipInputEvent = { input: htmlInput, value: 'testTag' };
        component.drawingTagsForm.setValue(event.value);
        component.addTag(event);
        expect(component.drawingTags).toContain(event.value);
    });

    it('addTag should delete duplicated tag before adding it and call filterCarrouselImagesWithTags when tag form is invalid', () => {
        const htmlInput: HTMLInputElement = document.createElement('input');
        const event: MatChipInputEvent = { input: htmlInput, value: 'testTag' };
        const event2: MatChipInputEvent = { input: htmlInput, value: 'testTag' };
        component.drawingTagsForm.setValue(event.value);
        component.drawingTagsForm.setValue(event2.value);
        const deleteTagSpy = spyOn(component, 'deleteTag');
        component.addTag(event);
        component.addTag(event2);
        expect(deleteTagSpy).toHaveBeenCalled();
        expect(component.drawingTags).toContain(event2.value);
    });

    it('addTag should not add the tag and call filterCarrouselImagesWithTags when tag form is invalid', () => {
        const htmlInput: HTMLInputElement = document.createElement('input');
        const event: MatChipInputEvent = { input: htmlInput, value: 'test?Tag' };
        component.drawingTagsForm.setValue(event.value);
        component.addTag(event);
        expect(component.drawingTags).not.toContain(event.value);
    });

    it('deleteTag should delete a tag if it exist and call filterCarrouselImagesWithTags', () => {
        const testTag = 'testTag';
        component.drawingTags = [testTag];
        component.deleteTag(testTag);
        expect(component.drawingTags).not.toContain(testTag);
    });

    it('deleteTag should not call filterCarrouselImagesWithTags if the tag does not exist', () => {
        const testTag = 'testTag';
        component.drawingTags = [testTag];
        component.deleteTag('none');
        expect(component.drawingTags).toContain(testTag);
    });
});
