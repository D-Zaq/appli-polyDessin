import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { MatDialogTestHelper } from '@app/classes/mat-dialog-test-helper';
import { Vec2 } from '@app/classes/vec2';
import { CREATED_HTTP_STATUS, IMAGE_LOADING_TIME, NO_CONTENT_HTTP_STATUS } from '@app/constants/constants';
import { MaterialModule } from '@app/material.module';
import { DatabaseService } from '@app/services/database/database.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Drawing } from '@common/communication/drawing';
import { NgImageSliderComponent, NgImageSliderModule } from 'ng-image-slider';
import { of } from 'rxjs';
import { DrawingsCarouselDialogComponent } from './drawings-carousel-dialog.component';
describe('DrawingsCarouselDialogComponent', () => {
    let component: DrawingsCarouselDialogComponent;
    let fixture: ComponentFixture<DrawingsCarouselDialogComponent>;
    const mockDialogRef = {
        close: jasmine.createSpy('close'),
    };
    const mockSnackbar = {
        open: jasmine.createSpy('open'),
    };
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let databaseServiceSpy: jasmine.SpyObj<DatabaseService>;
    let imageSliderSpy: jasmine.SpyObj<NgImageSliderComponent>;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtx: CanvasRenderingContext2D;
    let previewCtx: CanvasRenderingContext2D;
    // tslint:disable:no-any / reason: jasmine spy on function
    let dialogOpenSpy: jasmine.Spy<any>;

    beforeEach(async(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'isCanvasEmpty', 'updateUndoRedoActions']);
        databaseServiceSpy = jasmine.createSpyObj('DatabaseService', ['getDrawings', 'deleteDrawing']);
        imageSliderSpy = jasmine.createSpyObj('NgImageSliderComponent', ['setSliderImages']);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, MaterialModule, NgImageSliderModule],
            declarations: [DrawingsCarouselDialogComponent, NgImageSliderComponent],
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: MatDialogRef, useValue: mockDialogRef },
                { provide: DatabaseService, useValue: databaseServiceSpy },
                { provide: NgImageSliderComponent, useValue: imageSliderSpy },
                { provide: MatDialog, useClass: MatDialogTestHelper },
                { provide: MatSnackBar, useValue: mockSnackbar },
            ],
        }).compileComponents();
        databaseServiceSpy = TestBed.inject(DatabaseService) as jasmine.SpyObj<DatabaseService>;
        canvasTestHelper = TestBed.inject(CanvasTestHelper);

        const data: Drawing[] = [];
        databaseServiceSpy.getDrawings.and.returnValue(of(data));

        drawingServiceSpy.canvas = canvasTestHelper.canvas;
        baseCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtx = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        drawingServiceSpy.baseCtx = baseCtx;
        drawingServiceSpy.previewCtx = previewCtx;

        dialogOpenSpy = spyOn<any>(TestBed.inject(MatDialog), 'open').and.callThrough();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DrawingsCarouselDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('getDrawings should get all the drawings on the database', () => {
        component.isGettingImages = true;
        const createCarouselImageSpy = spyOn(component, 'createCarouselImages');
        component.getDrawings();
        expect(createCarouselImageSpy).toHaveBeenCalled();
        expect(component.isGettingImages).toBeFalse();
    });

    it('createCarouselImages should not call setCarouselImages', () => {
        const testDrawing: Drawing = { name: 'test', tags: [], _id: 'test', url: 'test' };
        const filterCarrouselImagesWithTagsSpy = spyOn(component, 'filterCarrouselImagesWithTags');
        const data: Drawing[] = [];
        data.push(testDrawing);
        component.createCarouselImages(data);
        expect(filterCarrouselImagesWithTagsSpy).not.toHaveBeenCalled();
    });

    it('setCarouselImages should create drawings images in gallery and set the correct imageSize for two or less drawings', () => {
        const drawings: Drawing[] = [];
        const testImageSize = { width: '1200px', height: '600px' };
        const testDrawing: Drawing = { name: 'test', tags: [], _id: 'test', url: 'test' };

        drawings.push(testDrawing);
        component.setCarouselImages(drawings);
        expect(component.imageSize).toEqual(testImageSize);
        expect(component.carouselImages.length).toEqual(drawings.length + 1);
    });

    it('setCarouselImages should create drawings images in gallery and set the correct imageSize for plus two drawings in carousel', () => {
        const drawings: Drawing[] = [];
        const testImageSize = { width: '395px', height: '300px' };
        const testDrawing: Drawing = { name: 'test', tags: [], _id: 'test', url: 'test' };
        const testDrawing2: Drawing = { name: 'test', tags: [], _id: 'test', url: 'test' };
        const testDrawing3: Drawing = { name: 'test', tags: [], _id: 'test', url: 'test' };
        drawings.push(testDrawing);
        drawings.push(testDrawing2);
        drawings.push(testDrawing3);
        component.setCarouselImages(drawings);
        expect(component.imageSize).toEqual(testImageSize);
        expect(component.carouselImages.length).toEqual(drawings.length + 1);
    });

    it('getTags should return the tags of the drawing in the correct form', () => {
        const testDrawing = {} as Drawing;
        const testTags = ['testTag', 'testTag2'];
        testDrawing.tags = testTags;
        expect(component.getTags(testDrawing)).toEqual('\nLes tags: ' + 'testTag,testTag2');
    });

    it('getTags should return the tags of the drawing in the correct form', () => {
        const testDrawing = {} as Drawing;
        const testTags: string[] = [];
        testDrawing.tags = testTags;
        expect(component.getTags(testDrawing)).toEqual('');
    });

    it('getDrawingsContainingTags should return only the drawings containing the tag', () => {
        component.drawingTags = ['testTag', 'testTag2', 'testTag3'];
        const testDrawing = {} as Drawing;
        testDrawing.tags = ['testTag'];
        const testDrawing2 = {} as Drawing;
        testDrawing2.tags = ['testTag2'];
        const testDrawing3 = {} as Drawing;
        testDrawing3.tags = ['testTag3'];
        const testDrawing4 = {} as Drawing;
        testDrawing4.tags = ['testTag4'];
        component.drawings = [testDrawing, testDrawing2, testDrawing3, testDrawing4];
        expect(component.getDrawingsContainingTags()).toEqual([testDrawing, testDrawing2, testDrawing3]);
    });

    it('getDrawingsContainingTags should return all the drawings when not filtering ', () => {
        component.drawingTags = [];
        const testDrawing = {} as Drawing;
        component.drawings = [testDrawing];
        expect(component.getDrawingsContainingTags()).toEqual(component.drawings);
    });

    it('filterCarrouselImagesWithTags should call getDrawingsContainingTags and setCarouselImages', () => {
        component.isGettingImages = true;
        const getDrawingsContainingTagsSpy = spyOn(component, 'getDrawingsContainingTags');
        const setCarouselImagesSpy = spyOn(component, 'setCarouselImages');
        component.filterCarrouselImagesWithTags();
        expect(getDrawingsContainingTagsSpy).toHaveBeenCalled();
        expect(setCarouselImagesSpy).toHaveBeenCalled();
    });

    it('openDrawing should open dialog if canvas is not empty', () => {
        drawingServiceSpy.isCanvasEmpty.and.returnValue(false);
        const testDrawing: Drawing = { name: 'test', tags: [], _id: 'test', url: 'test' };
        const testDrawing2: Drawing = { name: 'test', tags: [], _id: 'test', url: 'test' };
        component.drawings.push(testDrawing);
        component.drawings.push(testDrawing2);
        component.openDrawing(2);

        expect(dialogOpenSpy).toHaveBeenCalled();
    });

    it("openDrawing should call drawingService's clearCanvas and drawImage and close dialog if canvas empty", (done) => {
        const drawImageSpy = spyOn(drawingServiceSpy.baseCtx, 'drawImage');
        const canvasSizeTester: Vec2 = { x: 250, y: 250 };
        drawingServiceSpy.canvasSize = canvasSizeTester;
        const testDrawing: Drawing = { name: 'test', tags: [], _id: 'test', url: drawingServiceSpy.canvas.toDataURL() };
        const testDrawing2: Drawing = { name: 'test', tags: [], _id: 'test', url: drawingServiceSpy.canvas.toDataURL() };
        component.drawings.push(testDrawing);
        component.drawings.push(testDrawing2);
        drawingServiceSpy.isCanvasEmpty.and.returnValue(true);
        component.openDrawing(2);

        setTimeout(() => {
            expect(drawingServiceSpy.clearCanvas).toHaveBeenCalled();
            expect(drawImageSpy).toHaveBeenCalledTimes(2);
            expect(mockDialogRef.close).toHaveBeenCalled();
            expect(drawingServiceSpy.updateUndoRedoActions).toHaveBeenCalled();
            done();
        }, IMAGE_LOADING_TIME);
    });

    it('openSnackBar should open snackbar', () => {
        const testMessage = 'testing';
        const testaction = 'test';
        const testType = 'testing-snackbar';
        component.openSnackBar(testMessage, testaction, testType);
        expect(mockSnackbar.open).toHaveBeenCalled();
    });

    it("deleteDrawing should call databaseService's deleteDrawing, open error red-snackBar and call component's getDrawings", () => {
        component.imagesSlider.visiableImageIndex = 1;
        const openSnackBarSpy = spyOn(component, 'openSnackBar');
        const getDrawingsSpy = spyOn(component, 'getDrawings');
        const testDrawing: Drawing = { name: 'test', tags: [], _id: 'test', url: 'test' };
        const testDrawing2: Drawing = { name: 'test', tags: [], _id: 'test', url: 'test' };
        component.drawings.push(testDrawing);
        component.drawings.push(testDrawing2);
        databaseServiceSpy.deleteDrawing.and.returnValue(of(NO_CONTENT_HTTP_STATUS));
        component.deleteDrawing();
        expect(databaseServiceSpy.deleteDrawing).toHaveBeenCalled();
        expect(openSnackBarSpy).toHaveBeenCalledWith('le dessin est introuvable au niveau du serveur', 'Fermer', 'red-snackbar');
        expect(getDrawingsSpy).toHaveBeenCalled();
    });

    it("deleteDrawing should call databaseService's deleteDrawing, open sccess green-snackBar and call component's getDrawings", () => {
        component.imagesSlider.visiableImageIndex = 1;
        const openSnackBarSpy = spyOn(component, 'openSnackBar');
        const getDrawingsSpy = spyOn(component, 'getDrawings');
        const testDrawing: Drawing = { name: 'test', tags: [], _id: 'test', url: 'test' };
        const testDrawing2: Drawing = { name: 'test', tags: [], _id: 'test', url: 'test' };
        const testDrawing3: Drawing = { name: 'test', tags: [], _id: 'test', url: 'test' };
        const testDrawing4: Drawing = { name: 'test', tags: [], _id: 'test', url: 'test' };
        const testDrawing5: Drawing = { name: 'test', tags: [], _id: 'test', url: 'test' };
        const testDrawing6: Drawing = { name: 'test', tags: [], _id: 'test', url: 'test' };
        component.drawings.push(testDrawing);
        component.drawings.push(testDrawing2);
        component.drawings.push(testDrawing3);
        component.drawings.push(testDrawing4);
        component.drawings.push(testDrawing5);
        component.drawings.push(testDrawing6);
        databaseServiceSpy.deleteDrawing.and.returnValue(of(CREATED_HTTP_STATUS));
        component.deleteDrawing();
        expect(databaseServiceSpy.deleteDrawing).toHaveBeenCalled();
        expect(openSnackBarSpy).toHaveBeenCalledWith('votre dessin a été supprimé avec succès', 'Fermer', 'green-snackbar');
        expect(getDrawingsSpy).toHaveBeenCalled();
    });

    it("deleteDrawing should not call databaseService's deleteDrawing, open sccess green-snackBar and call component's getDrawings when there is no drawing on carousel", () => {
        component.imagesSlider.visiableImageIndex = 1;
        const openSnackBarSpy = spyOn(component, 'openSnackBar');
        const getDrawingsSpy = spyOn(component, 'getDrawings');
        databaseServiceSpy.deleteDrawing.and.returnValue(of(CREATED_HTTP_STATUS));
        component.deleteDrawing();
        expect(databaseServiceSpy.deleteDrawing).not.toHaveBeenCalled();
        expect(openSnackBarSpy).not.toHaveBeenCalledWith('votre dessin a été supprimé avec succès', 'Fermer', 'green-snackbar');
        expect(getDrawingsSpy).not.toHaveBeenCalled();
    });

    it('addTag should add the tag and call filterCarrouselImagesWithTags when tag form is valid', () => {
        const htmlInput: HTMLInputElement = document.createElement('input');
        const event: MatChipInputEvent = { input: htmlInput, value: 'testTag' };
        component.drawingTagsForm.setValue(event.value);
        const filterCarrouselImagesWithTagsSpy = spyOn(component, 'filterCarrouselImagesWithTags');
        component.addTag(event);
        expect(component.drawingTags).toContain(event.value);
        expect(filterCarrouselImagesWithTagsSpy).toHaveBeenCalled();
    });

    it('addTag should delete duplicated tag before adding it and call filterCarrouselImagesWithTags when tag form is invalid', () => {
        const htmlInput: HTMLInputElement = document.createElement('input');
        const event: MatChipInputEvent = { input: htmlInput, value: 'testTag' };
        const event2: MatChipInputEvent = { input: htmlInput, value: 'testTag' };
        component.drawingTagsForm.setValue(event.value);
        component.drawingTagsForm.setValue(event2.value);
        const deleteTagSpy = spyOn(component, 'deleteTag');
        const filterCarrouselImagesWithTagsSpy = spyOn(component, 'filterCarrouselImagesWithTags');
        component.addTag(event);
        component.addTag(event2);
        expect(deleteTagSpy).toHaveBeenCalled();
        expect(component.drawingTags).toContain(event2.value);
        expect(filterCarrouselImagesWithTagsSpy).toHaveBeenCalled();
    });

    it('addTag should not add the tag and call filterCarrouselImagesWithTags when tag form is invalid', () => {
        const htmlInput: HTMLInputElement = document.createElement('input');
        const event: MatChipInputEvent = { input: htmlInput, value: 'test?Tag' };
        component.drawingTagsForm.setValue(event.value);
        const filterCarrouselImagesWithTagsSpy = spyOn(component, 'filterCarrouselImagesWithTags');
        component.addTag(event);
        expect(component.drawingTags).not.toContain(event.value);
        expect(filterCarrouselImagesWithTagsSpy).not.toHaveBeenCalled();
    });

    it('deleteTag should delete a tag if it exist and call filterCarrouselImagesWithTags', () => {
        const testTag = 'testTag';
        const filterCarrouselImagesWithTagsSpy = spyOn(component, 'filterCarrouselImagesWithTags');
        component.drawingTags = [testTag];
        component.deleteTag(testTag);
        expect(component.drawingTags).not.toContain(testTag);
        expect(filterCarrouselImagesWithTagsSpy).toHaveBeenCalled();
    });

    it('deleteTag should not call filterCarrouselImagesWithTags if the tag does not exist', () => {
        const testTag = 'testTag';
        const filterCarrouselImagesWithTagsSpy = spyOn(component, 'filterCarrouselImagesWithTags');
        component.drawingTags = [testTag];
        component.deleteTag('none');
        expect(component.drawingTags).toContain(testTag);
        expect(filterCarrouselImagesWithTagsSpy).not.toHaveBeenCalled();
    });
});
