import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSliderModule } from '@angular/material/slider';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { MatDialogTestHelper } from '@app/classes/mat-dialog-test-helper';
import { SidebarButton } from '@app/classes/sidebar-button';
import { AttributeEditorComponent } from '@app/components/attribute-editor/attribute-editors/attribute-editor.component';
import { ColorPickComponent } from '@app/components/color/color-picker/color-picker.component';
import { GRID_DEFAULT_SIZE, GRID_MAXIMUM_SIZE, GRID_MINIMUM_SIZE, GRID_SIZE_MULTIPLE, MINIMUM_HEIGHT, MINIMUM_WIDTH } from '@app/constants/constants';
import { toolButtons } from '@app/constants/tool-button';
import { MaterialModule } from '@app/material.module';
import { ColorModule } from '@app/modules/color.module';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ColorPickerModule } from '@syncfusion/ej2-angular-inputs';
import { of } from 'rxjs';
import { SidebarComponent } from './sidebar.component';
// tslint:disable:max-file-line-count / reason: tests file
describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;
    // tslint:disable:no-any / reason: jasmine spy on function
    let dialogOpenSpy: jasmine.Spy<any>;
    // let dialogAfterClosedSpy: jasmine.Spy<any>; / reason : tests
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    let tool1: SidebarButton;
    let tool2: SidebarButton;
    let event: KeyboardEvent;
    let canvasTestHelper: CanvasTestHelper;

    beforeEach(async(() => {
        tool1 = new SidebarButton('crayon', 'c');
        tool2 = new SidebarButton('rectangle', '1');
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', [
            'isCanvasEmpty',
            'newCanvasInitialSize',
            'getPrimaryColor',
            'getSecondaryColor',
            'drawGrid',
            'clearCanvas',
        ]);
        TestBed.configureTestingModule({
            imports: [MaterialModule, ColorModule, ColorPickerModule, MatSliderModule],
            declarations: [SidebarComponent, ColorPickComponent, AttributeEditorComponent],
            providers: [
                { provide: DrawingService, useValue: drawingServiceSpy },
                { provide: MatDialog, useClass: MatDialogTestHelper },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
        drawingServiceSpy = TestBed.inject(DrawingService) as jasmine.SpyObj<DrawingService>;
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        drawingServiceSpy.canvas = canvasTestHelper.canvas;
        dialogOpenSpy = spyOn<any>(TestBed.inject(MatDialog), 'open').and.callThrough();
        // dialogAfterClosedSpy = spyOn<any>(TestBed.inject(MatDialog), 'afterClosed').and.callThrough();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('#selectCurrentTool should change #currentTool to tool', () => {
        component.currentTool = tool2;
        component.selectCurrentTool(tool1);
        expect(component.currentTool).toBe(tool1);
    });

    it('#selectCurrentTool(SidebarButton) should not change tool if already #currentTool', () => {
        component.currentTool = tool1;
        component.selectCurrentTool(tool1);
        expect(component.currentTool).toBe(tool1);
    });
    it('#keyDownEvent should change #currentTool to pencil', () => {
        component.currentTool = tool2;
        event = new KeyboardEvent('keyup', {
            key: 'k',
        });
        component.keyUpEvent(event);
        event = new KeyboardEvent('keydown', {
            key: 'c',
        });
        component.keyDownEvent(event);
        const pencilIndex = 0;
        expect(component.currentTool).toBe(toolButtons[pencilIndex]);
    });
    it('#keyDownEvent should change #currentTool to rectangle', () => {
        component.currentTool = tool2;
        event = new KeyboardEvent('keydown', {
            key: '1',
        });
        component.keyDownEvent(event);
        const rectangleIndex = 2;
        expect(component.currentTool).toBe(toolButtons[rectangleIndex]);
    });
    it('#keyDownEvent should change #currentTool to ellipse', () => {
        component.currentTool = tool2;
        event = new KeyboardEvent('keydown', {
            key: '2',
        });
        component.keyDownEvent(event);
        const ellipseIndex = 3;
        expect(component.currentTool).toBe(toolButtons[ellipseIndex]);
    });
    it('#keyDownEvent should change #currentTool to line', () => {
        component.currentTool = tool2;
        event = new KeyboardEvent('keydown', {
            key: 'l',
        });
        component.keyDownEvent(event);
        const lineIndex = 5;
        expect(component.currentTool).toBe(toolButtons[lineIndex]);
    });
    it('#keyDownEvent should change #currentTool to line and onkeydown', () => {
        component.currentTool = tool2;
        event = new KeyboardEvent('keydown', {
            key: 'l',
        });
        component.keyDownEvent(event);
        event = new KeyboardEvent('keydown', {
            key: 'backspace',
        });
        component.keyDownEvent(event);
        const lineIndex = 5;
        expect(component.currentTool).toBe(toolButtons[lineIndex]);
    });
    it('#keyDownEvent should change #currentTool to eraser', () => {
        component.currentTool = tool2;
        event = new KeyboardEvent('keydown', {
            key: 'e',
        });
        component.keyDownEvent(event);
        const eraserIndex = 8;
        expect(component.currentTool).toBe(toolButtons[eraserIndex]);
    });

    it('#keyDownEvent should change #currentTool to text', () => {
        component.currentTool = tool2;

        event = new KeyboardEvent('keydown', {
            key: 't',
        });
        component.keyDownEvent(event);
        const textIndex = 6;
        expect(component.currentTool).toBe(toolButtons[textIndex]);
    });
    it('#keyDownEvent should call text on keydown', () => {
        component.currentTool = tool2;
        event = new KeyboardEvent('keydown', {
            key: 't',
        });
        component.toolSelectorService.getCurrentTool().usesKeyboard = true;
        component.keyDownEvent(event);
        event = new KeyboardEvent('keydown', {
            key: ' ',
        });
        component.keyDownEvent(event);
        const textIndex = 6;
        expect(component.currentTool.tooltip).not.toBe(toolButtons[textIndex].tooltip);
    });
    it('#keyDownEvent should change #currentTool to ellipse', () => {
        component.currentTool = tool2;

        event = new KeyboardEvent('keydown', {
            key: '2',
        });
        component.keyDownEvent(event);
        const ellipseIndex = 3;
        expect(component.currentTool).toBe(toolButtons[ellipseIndex]);
    });
    it('#keyDownEvent should change #currentTool to polygon', () => {
        component.currentTool = tool2;
        event = new KeyboardEvent('keydown', {
            key: '3',
        });
        component.keyDownEvent(event);
        const polygonIndex = 4;
        expect(component.currentTool).toBe(toolButtons[polygonIndex]);
    });
    it('#keyDownEvent should change #currentTool to stamp', () => {
        component.currentTool = tool2;
        event = new KeyboardEvent('keydown', {
            key: 'd',
        });
        component.keyDownEvent(event);
        const stampIndex = 9;
        expect(component.currentTool).toBe(toolButtons[stampIndex]);
    });
    it('#keyDownEvent should change #currentTool to paintBucket', () => {
        component.currentTool = tool2;
        event = new KeyboardEvent('keydown', {
            key: 'b',
        });
        component.keyDownEvent(event);
        const paintbucketIndex = 7;
        expect(component.currentTool).toBe(toolButtons[paintbucketIndex]);
    });
    it('#keyDownEvent should change #currentTool to rectangleSelector', () => {
        component.currentTool = tool2;
        event = new KeyboardEvent('keydown', {
            key: 'm',
        });
        component.keyDownEvent(event);
        event = new KeyboardEvent('keydown', {
            key: 'r',
        });
        component.keyDownEvent(event);
        const rectangleSelectorIndex = 11;
        expect(component.currentTool).toBe(toolButtons[rectangleSelectorIndex]);
    });
    it('#keyDownEvent should change #currentTool to ellipseSelector', () => {
        component.currentTool = tool2;
        event = new KeyboardEvent('keydown', {
            key: 'Delete',
        });
        component.keyDownEvent(event);

        event = new KeyboardEvent('keydown', {
            key: 's',
        });
        component.keyDownEvent(event);
        const ellipseSelectorIndex = 12;
        expect(component.currentTool).toBe(toolButtons[ellipseSelectorIndex]);
    });

    it('#keyDownEvent should call createNewDrawing', () => {
        component.currentTool = tool2;
        const createNewDrawingSpy = spyOn(component, 'createNewDrawing');
        const eventInit: KeyboardEventInit = {
            key: 'o',
            ctrlKey: true,
        };
        event = new KeyboardEvent('keydown', eventInit);
        component.keyDownEvent(event);
        expect(createNewDrawingSpy).toHaveBeenCalled();
    });

    it('#keyDownEvent should call createNewDrawing', () => {
        component.currentTool = tool2;
        const createNewDrawingSpy = spyOn(component, 'createNewDrawing');
        const eventInit: KeyboardEventInit = {
            key: 'O',
            ctrlKey: true,
        };
        event = new KeyboardEvent('keydown', eventInit);
        component.keyDownEvent(event);
        expect(createNewDrawingSpy).toHaveBeenCalled();
    });

    it('#keyDownEvent should call openSaveDrawingDialog', () => {
        component.currentTool = tool2;
        const openSaveDrawingDialogSpy = spyOn(component, 'openSaveDrawingDialog');
        const eventInit: KeyboardEventInit = {
            key: 's',
            ctrlKey: true,
        };
        event = new KeyboardEvent('keydown', eventInit);
        component.keyDownEvent(event);
        expect(openSaveDrawingDialogSpy).toHaveBeenCalled();
    });

    it('#keyDownEvent should call openExportDrawingDialog', () => {
        component.currentTool = tool2;
        const openExportDrawingDialogSpy = spyOn(component, 'openExportDrawingDialog');
        const eventInit: KeyboardEventInit = {
            key: 'e',
            ctrlKey: true,
        };
        event = new KeyboardEvent('keydown', eventInit);
        component.keyDownEvent(event);
        expect(openExportDrawingDialogSpy).toHaveBeenCalled();
    });

    it('#keyDownEvent should call openExportDrawingDialog', () => {
        component.currentTool = tool2;
        const openExportDrawingDialogSpy = spyOn(component, 'openExportDrawingDialog');
        const eventInit: KeyboardEventInit = {
            key: 'E',
            ctrlKey: true,
        };
        event = new KeyboardEvent('keydown', eventInit);
        component.keyDownEvent(event);
        expect(openExportDrawingDialogSpy).toHaveBeenCalled();
    });

    it('#keyDownEvent should call openSaveDrawingDialog', () => {
        component.currentTool = tool2;
        const openDrawingsCarouselDialogSpy = spyOn(component, 'openDrawingsCarouselDialog');
        const eventInit: KeyboardEventInit = {
            key: 'g',
            ctrlKey: true,
        };
        event = new KeyboardEvent('keydown', eventInit);
        component.keyDownEvent(event);
        expect(openDrawingsCarouselDialogSpy).toHaveBeenCalled();
    });

    it('#keyDownEvent should call openSaveDrawingDialog', () => {
        component.currentTool = tool2;
        const openDrawingsCarouselDialogSpy = spyOn(component, 'openDrawingsCarouselDialog');
        const eventInit: KeyboardEventInit = {
            key: 'G',
            ctrlKey: true,
        };
        event = new KeyboardEvent('keydown', eventInit);
        component.keyDownEvent(event);
        expect(openDrawingsCarouselDialogSpy).toHaveBeenCalled();
    });

    it("createNewDrawing should call drawingService's newCanvasInitialSize if the canvas is empty", () => {
        drawingServiceSpy.isCanvasEmpty.and.callFake(() => {
            return true;
        });
        component.createNewDrawing(MINIMUM_WIDTH, MINIMUM_HEIGHT);
        expect(drawingServiceSpy.newCanvasInitialSize).toHaveBeenCalled();
    });

    it('createNewDrawing should open dialog if the canvas is not empty and change iscreateNewDrawingDialogOpen to false', () => {
        drawingServiceSpy.isCreateNewDrawingDialogOpen = true;
        dialogOpenSpy.and.returnValue({ afterClosed: () => of(true) });
        drawingServiceSpy.isCanvasEmpty.and.callFake(() => {
            return false;
        });
        component.createNewDrawing(MINIMUM_WIDTH, MINIMUM_HEIGHT);
        expect(dialogOpenSpy).toHaveBeenCalled();
        expect(drawingServiceSpy.isCreateNewDrawingDialogOpen).toBeFalse();
    });

    it('openExportDrawingDialog should open dialog and change isExportDrawingDialogOpen to false', () => {
        component.isExportDrawingDialogOpen = true;
        dialogOpenSpy.and.returnValue({ afterClosed: () => of(true) });
        component.openExportDrawingDialog();
        expect(dialogOpenSpy).toHaveBeenCalled();
        expect(component.isExportDrawingDialogOpen).toBeFalse();
    });

    it('openSaveDrawingDialog should open dialog and change isSaveDrawingDialogOpen to false', () => {
        component.isSaveDrawingDialogOpen = true;
        dialogOpenSpy.and.returnValue({ afterClosed: () => of(true) });
        component.openSaveDrawingDialog();
        expect(dialogOpenSpy).toHaveBeenCalled();
        expect(component.isSaveDrawingDialogOpen).toBeFalse();
    });

    it('openDrawingsCarouselDialog should open dialog and change isDrawingsCarouselDialogOpen to false', () => {
        drawingServiceSpy.isDrawingsCarouselDialogOpen = true;
        dialogOpenSpy.and.returnValue({ afterClosed: () => of(true) });
        component.openDrawingsCarouselDialog();
        expect(dialogOpenSpy).toHaveBeenCalled();
        expect(drawingServiceSpy.isDrawingsCarouselDialogOpen).toBeFalse();
    });

    it("windowInnerWidth should return window's inner width ", () => {
        expect(component.windowInnerWidth).toEqual(window.innerWidth);
    });

    it("windowInnerHeight should return window's inner height ", () => {
        expect(component.windowInnerHeight).toEqual(window.innerHeight);
    });

    it('#keyDownEvent should change #currentTool to aerosol', () => {
        component.currentTool = tool2;
        event = new KeyboardEvent('keydown', {
            key: 'a',
        });
        component.keyDownEvent(event);
        const aerosolIndex = 1;
        expect(component.currentTool).toBe(toolButtons[aerosolIndex]);
    });
    it('#keyDownEvent should change #currentTool to pipette', () => {
        component.currentTool = tool2;
        event = new KeyboardEvent('keydown', {
            key: 'i',
        });
        component.keyDownEvent(event);
        const pipetteIndex = 10;
        expect(component.currentTool).toBe(toolButtons[pipetteIndex]);
    });

    it("#keyDownEvent should call drawingService's drawGrid and substract 5 from drawingService's gridSquareSize when it's greater then 5", () => {
        component.currentTool = tool2;
        drawingServiceSpy.gridSquareSize = GRID_DEFAULT_SIZE;
        const eventInit: KeyboardEventInit = {
            key: '-',
            ctrlKey: false,
        };
        event = new KeyboardEvent('keydown', eventInit);
        drawingServiceSpy.gridSquareSize = GRID_DEFAULT_SIZE;

        component.keyDownEvent(event);
        expect(drawingServiceSpy.gridSquareSize).toEqual(GRID_DEFAULT_SIZE - GRID_SIZE_MULTIPLE);
        expect(drawingServiceSpy.drawGrid).toHaveBeenCalled();
    });

    it("#keyDownEvent should not call drawGrid and not substract 5 from drawingService's gridSquareSize when it's lesser or equals 5", () => {
        component.currentTool = tool2;
        drawingServiceSpy.gridSquareSize = GRID_MINIMUM_SIZE;
        const eventInit: KeyboardEventInit = {
            key: '-',
            ctrlKey: false,
        };
        event = new KeyboardEvent('keydown', eventInit);
        component.keyDownEvent(event);
        expect(drawingServiceSpy.gridSquareSize).toEqual(GRID_MINIMUM_SIZE);
        expect(drawingServiceSpy.drawGrid).not.toHaveBeenCalled();
    });

    it("#keyDownEvent should call drawingService's drawGrid and add 5 to drawingService's gridSquareSize when it's lesser then 100", () => {
        component.currentTool = tool2;
        drawingServiceSpy.gridSquareSize = GRID_DEFAULT_SIZE;
        const eventInit: KeyboardEventInit = {
            key: '=',
            ctrlKey: false,
        };
        event = new KeyboardEvent('keydown', eventInit);
        component.keyDownEvent(event);
        expect(drawingServiceSpy.gridSquareSize).toEqual(GRID_DEFAULT_SIZE + GRID_SIZE_MULTIPLE);
        expect(drawingServiceSpy.drawGrid).toHaveBeenCalled();
    });

    it("#keyDownEvent should call drawingService's drawGrid and add 5 to drawingService's gridSquareSize when it's lesser then 100", () => {
        component.currentTool = tool2;
        drawingServiceSpy.gridSquareSize = GRID_DEFAULT_SIZE;
        const eventInit: KeyboardEventInit = {
            key: '+',
            ctrlKey: false,
        };
        event = new KeyboardEvent('keydown', eventInit);
        component.keyDownEvent(event);
        expect(drawingServiceSpy.gridSquareSize).toEqual(GRID_DEFAULT_SIZE + GRID_SIZE_MULTIPLE);
        expect(drawingServiceSpy.drawGrid).toHaveBeenCalled();
    });

    it("#keyDownEvent should not call drawGrid and not add 5 to drawingService's gridSquareSize when it's greater or equals 100", () => {
        component.currentTool = tool2;
        drawingServiceSpy.gridSquareSize = GRID_MAXIMUM_SIZE;
        const eventInit: KeyboardEventInit = {
            key: '=',
            ctrlKey: false,
        };
        event = new KeyboardEvent('keydown', eventInit);
        component.keyDownEvent(event);
        expect(drawingServiceSpy.gridSquareSize).toEqual(GRID_MAXIMUM_SIZE);
        expect(drawingServiceSpy.drawGrid).not.toHaveBeenCalled();
    });

    it("#keyDownEvent should not call drawGrid and not add 5 to drawingService's gridSquareSize when it's greater or equals 100", () => {
        component.currentTool = tool2;
        drawingServiceSpy.gridSquareSize = GRID_MAXIMUM_SIZE;
        const eventInit: KeyboardEventInit = {
            key: '+',
            ctrlKey: false,
        };
        event = new KeyboardEvent('keydown', eventInit);
        component.keyDownEvent(event);
        expect(drawingServiceSpy.gridSquareSize).toEqual(GRID_MAXIMUM_SIZE);
        expect(drawingServiceSpy.drawGrid).not.toHaveBeenCalled();
    });

    it("#keyDownEvent should change gridToggled state, drawingService's isGrid state and call drawingService's drawGrid", () => {
        const eventInit: KeyboardEventInit = {
            key: 'g',
            ctrlKey: false,
        };
        event = new KeyboardEvent('keydown', eventInit);
        component.keyDownEvent(event);
        expect(drawingServiceSpy.drawGrid).toHaveBeenCalled();
        expect(drawingServiceSpy.isGrid).toEqual(true);
        expect(component.gridToggled).toEqual(true);
    });

    it("#keyDownEvent should change gridToggled state, drawingService's isGrid state and call drawingService's drawGrid", () => {
        const eventInit: KeyboardEventInit = {
            key: 'G',
            ctrlKey: false,
        };
        event = new KeyboardEvent('keydown', eventInit);
        component.keyDownEvent(event);
        expect(drawingServiceSpy.drawGrid).toHaveBeenCalled();
        expect(drawingServiceSpy.isGrid).toEqual(true);
        expect(component.gridToggled).toEqual(true);
    });

    it('#undo action should do nothing if current tool has mouse down', () => {
        const eventInit: KeyboardEventInit = {
            key: 'z',
            ctrlKey: true,
        };
        event = new KeyboardEvent('keydown', eventInit);
        component.toolSelectorService.getCurrentTool().mouseDown = false;

        component.keyDownEvent(event);
        event = new KeyboardEvent('keydown', {
            key: 's',
        });
        component.keyDownEvent(event);
        component.toolSelectorService.getCurrentTool().mouseDown = true;
        expect(component.undoAction()).toBe(false);
    });
    it('#undo action should do nothing if current tool does not has mouse down', () => {
        event = new KeyboardEvent('keydown', {
            key: 's',
        });
        component.keyDownEvent(event);
        component.toolSelectorService.getCurrentTool().mouseDown = false;
        expect(component.undoAction()).toBe(true);
    });
    it('#redo action should do nothing if current tool does not has mouse down', () => {
        event = new KeyboardEvent('keydown', {
            key: 's',
        });
        component.keyDownEvent(event);
        component.toolSelectorService.getCurrentTool().mouseDown = false;
        expect(component.redoAction()).toBe(true);
    });
    it('#redo action should do nothing if current tool has mouse down', () => {
        event = new KeyboardEvent('keydown', {
            key: 's',
        });
        component.keyDownEvent(event);
        component.toolSelectorService.getCurrentTool().mouseDown = true;
        expect(component.redoAction()).toBe(false);
    });
});
