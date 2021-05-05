import { Component, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SidebarButton } from '@app/classes/sidebar-button';
import { GRID_MAXIMUM_SIZE, GRID_MINIMUM_SIZE, GRID_SIZE_MULTIPLE } from '@app/constants/constants';
import { AutoSaveService } from '@app/services/auto-save/auto-save.service';
import { ClipboardService } from '@app/services/clipboard/clipboard.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MagnetismService } from '@app/services/magnetism/magnetism.service';
import { SelectionService } from '@app/services/selection/selection.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector/tool-selector.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { CreateNewDrawingDialogComponent } from './create-new-drawing-dialog/create-new-drawing-dialog.component';
import { DrawingsCarouselDialogComponent } from './drawings-carousel-dialog/drawings-carousel-dialog.component';
import { ExportDrawingDialogComponent } from './export-drawing-dialog/export-drawing-dialog.component';
import { SaveDrawingDialogComponent } from './save-drawing-dialog/save-drawing-dialog.component';
@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    constructor(
        public toolSelectorService: ToolSelectorService,
        private drawingService: DrawingService,
        public dialog: MatDialog,
        private undoRedoService: UndoRedoService,
        private selectionService: SelectionService,
        private clipboardService: ClipboardService,
        private automaticSavingService: AutoSaveService,
        public magnetismService: MagnetismService,
    ) {
        this.selectCurrentTool(this.toolSelectorService.getToolButtons(0));
    }

    currentTool: SidebarButton;
    isExportDrawingDialogOpen: boolean = false;
    isSaveDrawingDialogOpen: boolean = false;
    gridToggled: boolean = false;
    selectCurrentTool(newSelectedTool: SidebarButton): void {
        this.currentTool = newSelectedTool;
        this.toolSelectorService.updateCurrentTool(this.currentTool.tooltip);
    }

    @HostListener('window:keyup', ['$event'])
    keyUpEvent(event: KeyboardEvent): void {
        this.toolSelectorService.getCurrentTool().onKeyUp(event);
    }

    // tslint:disable-next-line: cyclomatic-complexity / reason : tests
    @HostListener('window:keydown', ['$event'])
    keyDownEvent(event: KeyboardEvent): void {
        if (this.toolSelectorService.getCurrentTool().usesKeyboard) {
            // if tool uses keyboard (ex: text tool), bypass keyboard events
            this.toolSelectorService.getCurrentTool().onKeyDown(event);
            return;
        }
        if (
            !this.drawingService.isCreateNewDrawingDialogOpen &&
            !this.drawingService.isDrawingsCarouselDialogOpen &&
            !this.isExportDrawingDialogOpen &&
            !this.isSaveDrawingDialogOpen
        ) {
            switch (event.key) {
                case !event.ctrlKey && 'c':
                case !event.ctrlKey && 'C':
                    this.selectCurrentTool(this.toolSelectorService.getToolButtons(0));
                    break;
                case !event.ctrlKey && 'a':
                case !event.ctrlKey && 'A':
                    const spraypaintIndex = 1;
                    this.selectCurrentTool(this.toolSelectorService.getToolButtons(spraypaintIndex));
                    break;
                case '1':
                    const rectangleIndex = 2;
                    this.selectCurrentTool(this.toolSelectorService.getToolButtons(rectangleIndex));
                    break;
                case '2':
                    const ellipseIndex = 3;
                    this.selectCurrentTool(this.toolSelectorService.getToolButtons(ellipseIndex));
                    break;
                case '3':
                    const polygonIndex = 4;
                    this.selectCurrentTool(this.toolSelectorService.getToolButtons(polygonIndex));
                    break;
                case 'l':
                case 'L':
                    const lineIndex = 5;
                    this.selectCurrentTool(this.toolSelectorService.getToolButtons(lineIndex));
                    break;
                case !event.ctrlKey && 'e':
                case !event.ctrlKey && 'E':
                    event.preventDefault();
                    const eraserIndex = 8;
                    this.selectCurrentTool(this.toolSelectorService.getToolButtons(eraserIndex));
                    break;
                case 'd':
                case 'D':
                    const stampIndex = 9;
                    this.selectCurrentTool(this.toolSelectorService.getToolButtons(stampIndex));
                    break;
                case 'i':
                    const pipetteIndex = 10;
                    this.selectCurrentTool(this.toolSelectorService.getToolButtons(pipetteIndex));
                    break;
                case 't':
                    const textIndex = 6;
                    this.selectCurrentTool(this.toolSelectorService.getToolButtons(textIndex));
                    break;
                case 'b':
                    const paintbucketIndex = 7;
                    this.selectCurrentTool(this.toolSelectorService.getToolButtons(paintbucketIndex));
                    break;
                case event.ctrlKey && 'o':
                case event.ctrlKey && 'O':
                    event.preventDefault();
                    this.createNewDrawing(window.innerWidth, window.innerHeight);
                    break;
                case event.ctrlKey && 'E':
                case event.ctrlKey && 'e':
                    event.preventDefault();
                    this.openExportDrawingDialog();
                    break;
                case event.ctrlKey && 'S':
                case event.ctrlKey && 's':
                    event.preventDefault();
                    this.openSaveDrawingDialog();
                    break;
                case event.ctrlKey && 'G':
                case event.ctrlKey && 'g':
                    event.preventDefault();
                    this.openDrawingsCarouselDialog();
                    break;
                case 'r':
                case 'R':
                    const rectangleSelectorIndex = 11;
                    this.selectCurrentTool(this.toolSelectorService.getToolButtons(rectangleSelectorIndex));
                    console.log('test');
                    break;
                case !event.ctrlKey && 's':
                case !event.ctrlKey && 'S':
                    const ellipseSelectorIndex = 12;
                    this.selectCurrentTool(this.toolSelectorService.getToolButtons(ellipseSelectorIndex));
                    break;
                case !event.ctrlKey && 'v':
                case !event.ctrlKey && 'V':
                    const lassoSelectorIndex = 13;
                    this.selectCurrentTool(this.toolSelectorService.getToolButtons(lassoSelectorIndex));
                    break;
                case event.ctrlKey && 'z':
                case event.ctrlKey && 'Z':
                    if (!this.toolSelectorService.getCurrentTool().mouseDown) {
                        this.selectionService.onToolChange();
                        this.undoRedoService.onKeyDown(event);
                    }
                    break;
                case '-':
                    if (this.drawingService.gridSquareSize > GRID_MINIMUM_SIZE) {
                        this.drawingService.gridSquareSize = this.drawingService.gridSquareSize - GRID_SIZE_MULTIPLE;
                        this.drawingService.drawGrid();
                    }
                    break;
                case '=':
                case '+':
                    if (this.drawingService.gridSquareSize < GRID_MAXIMUM_SIZE) {
                        this.drawingService.gridSquareSize = this.drawingService.gridSquareSize + GRID_SIZE_MULTIPLE;
                        this.drawingService.drawGrid();
                    }
                    break;
                case 'g':
                case 'G':
                    this.drawingService.isGrid = !this.drawingService.isGrid;
                    this.gridToggled = !this.gridToggled;
                    this.drawingService.drawGrid();
                    break;
                case event.ctrlKey && 'x':
                case event.ctrlKey && 'X':
                case event.ctrlKey && 'c':
                case event.ctrlKey && 'C':
                case event.ctrlKey && 'v':
                case event.ctrlKey && 'V':
                case 'Delete':
                    this.clipboardService.onKeyDown(event);
                    this.toolSelectorService.setCurrentTool(this.selectionService);
                    break;
                case 'm':
                case 'M':
                    this.magnetismService.isMagnetismToggled = !this.magnetismService.isMagnetismToggled;
                    break;
                default:
                    this.toolSelectorService.getCurrentTool().onKeyDown(event);
            }
            setTimeout(() => {
                this.automaticSavingService.autoSaveDrawing();
            }, 0);
        }
    }

    createNewDrawing(windowInnerWidth: number, windowInnerHeight: number): void {
        const isCanvasEmpty = this.drawingService.isCanvasEmpty(this.drawingService.baseCtx);
        if (isCanvasEmpty) {
            this.drawingService.newCanvasInitialSize(windowInnerWidth, windowInnerHeight);
        } else {
            this.drawingService.isCreateNewDrawingDialogOpen = true;
            this.dialog
                .open(CreateNewDrawingDialogComponent)
                .afterClosed()
                .subscribe(() => {
                    this.drawingService.isCreateNewDrawingDialogOpen = false;
                });
        }
    }

    openExportDrawingDialog(): void {
        this.isExportDrawingDialogOpen = true;
        this.dialog
            .open(ExportDrawingDialogComponent)
            .afterClosed()
            .subscribe(() => {
                this.isExportDrawingDialogOpen = false;
            });
    }

    openSaveDrawingDialog(): void {
        this.isSaveDrawingDialogOpen = true;
        this.dialog
            .open(SaveDrawingDialogComponent)
            .afterClosed()
            .subscribe(() => {
                this.isSaveDrawingDialogOpen = false;
            });
    }

    openDrawingsCarouselDialog(): void {
        this.drawingService.isDrawingsCarouselDialogOpen = true;
        this.dialog
            .open(DrawingsCarouselDialogComponent, {
                width: '1250px',
                height: 'auto',
            })
            .afterClosed()
            .subscribe(() => {
                this.drawingService.isDrawingsCarouselDialogOpen = false;
            });
    }

    get windowInnerWidth(): number {
        return window.innerWidth;
    }

    get windowInnerHeight(): number {
        return window.innerHeight;
    }

    undoAction(): boolean {
        if (!this.toolSelectorService.getCurrentTool().mouseDown) {
            this.selectionService.onToolChange();
            this.undoRedoService.undoAction();
            return true;
        }
        return false;
    }

    redoAction(): boolean {
        if (!this.toolSelectorService.getCurrentTool().mouseDown) {
            this.selectionService.onToolChange();
            this.undoRedoService.redoAction();
            return true;
        }
        return false;
    }
}
