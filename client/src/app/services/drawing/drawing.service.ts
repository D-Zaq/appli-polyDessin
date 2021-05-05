import { Injectable } from '@angular/core';
import { ActionObject } from '@app/classes/action-object/action-object';
import { ActionResize } from '@app/classes/action-object/action-resize/action-resize';
import { Vec2 } from '@app/classes/vec2';
import {
    GRID_DEFAULT_SIZE,
    MAX_COLOR_INTENSITY,
    MAX_OPACITY,
    MAX_THICKNESS,
    MINIMUM_HEIGHT,
    MINIMUM_WIDTH,
    SIDE_BAR_WIDTH,
    WINDOW_SIZE_FOR_MINIMUM,
} from '@app/constants/constants';
import { SizeControllerId } from '@app/constants/size-controller-id';
import { ColorPickerService } from '@app/services/color/color-picker/color-picker.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class DrawingService {
    baseCtx: CanvasRenderingContext2D;
    previewCtx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    canvasSize: Vec2 = { x: (window.innerWidth - SIDE_BAR_WIDTH) / 2, y: window.innerHeight / 2 };
    isResizing: boolean = false;
    sizeControllerId: SizeControllerId = SizeControllerId.DefaultId;
    resizingPreviewDashedLine: boolean = false;
    gridCtx: CanvasRenderingContext2D;
    gridSquareSize: number = GRID_DEFAULT_SIZE;
    isGrid: boolean = false;
    gridLinesOpacity: number = MAX_OPACITY;
    isDrawingsCarouselDialogOpen: boolean = false;
    isCreateNewDrawingDialogOpen: boolean = false;
    image: HTMLImageElement | undefined;
    constructor(private colorPickerService: ColorPickerService, private undoRedoService: UndoRedoService) {
        this.undoRedoService.share.subscribe((actions: ActionObject[]) => {
            if (this.baseCtx && this.canvas) {
                if (!this.undoRedoService.isActionPopped) {
                    const lastAction = actions[actions.length - 1];
                    lastAction.execute(this);
                } else {
                    this.clearCanvas(this.baseCtx);
                    this.clearCanvas(this.previewCtx);

                    if (this.image) this.baseCtx.drawImage(this.image, 0, 0);

                    this.undoRedoService.actions.forEach((action) => {
                        if (!(action instanceof ActionResize)) action.execute(this);
                    });
                    if (this.undoRedoService.isPoppedActionResize === true) {
                        this.undoRedoService.resizeActions[this.undoRedoService.resizeActions.length - 1].execute(this);
                    }
                }
            }
        });
    }
    clearCanvas(context: CanvasRenderingContext2D): void {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    }

    getPrimaryColor(): string {
        return this.colorPickerService.primaryColor;
    }

    getSecondaryColor(): string {
        return this.colorPickerService.secondaryColor;
    }

    disablePreviewCanvasResizing(): void {
        this.isResizing = false;
        this.sizeControllerId = SizeControllerId.DefaultId;
        this.resizingPreviewDashedLine = false;
    }

    resizePreviewCanvas(event: MouseEvent): void {
        if (this.isResizing) {
            this.resizePreviewCanvasWidth(event);
            this.resizePreviewCanvasHeight(event);
        }
        this.drawGrid();
    }

    resizePreviewCanvasWidth(event: MouseEvent): void {
        if (this.sizeControllerId !== SizeControllerId.CenterBottomSizeController) {
            let newPreviewWidth = event.clientX - this.canvas.getBoundingClientRect().x;
            newPreviewWidth = newPreviewWidth < MINIMUM_WIDTH ? MINIMUM_WIDTH : newPreviewWidth;
            this.previewCtx.canvas.width = newPreviewWidth;
        }
    }

    resizePreviewCanvasHeight(event: MouseEvent): void {
        if (this.sizeControllerId !== SizeControllerId.CenterRightSizeController) {
            let newPreviewHeight = event.clientY - this.canvas.getBoundingClientRect().y;
            newPreviewHeight = newPreviewHeight < MINIMUM_HEIGHT ? MINIMUM_HEIGHT : newPreviewHeight;
            this.previewCtx.canvas.height = newPreviewHeight;
        }
    }

    updateEntireDrawingSurface(newPreviewHeight: number, newPreviewWidth: number): void {
        const actionResize: ActionObject = new ActionResize(newPreviewWidth, newPreviewHeight);
        this.undoRedoService.addAction(actionResize);
    }

    // https://stackoverflow.com/questions/331052/how-to-resize-html-canvas-element
    redrawCanvasImage(newPreviewHeight: number, newPreviewWidth: number): void {
        this.updateEntireDrawingSurface(newPreviewHeight, newPreviewWidth);
    }

    isCanvasEmpty(context: CanvasRenderingContext2D): boolean {
        const pixelBuffer = new Uint32Array(context.getImageData(0, 0, context.canvas.width, context.canvas.height).data.buffer);
        return !pixelBuffer.some((color) => color !== 0);
    }

    newCanvasInitialSize(windowInnerWidth: number, windowInnerHeight: number): void {
        const newWidth = windowInnerWidth > WINDOW_SIZE_FOR_MINIMUM ? (windowInnerWidth - SIDE_BAR_WIDTH) / 2 : MINIMUM_WIDTH;
        const newHeight = windowInnerHeight > WINDOW_SIZE_FOR_MINIMUM ? windowInnerHeight / 2 : MINIMUM_HEIGHT;
        const width = newWidth >= MINIMUM_WIDTH ? newWidth : MINIMUM_WIDTH;
        const height = newHeight >= MINIMUM_HEIGHT ? newHeight : MINIMUM_HEIGHT;
        this.updateUndoRedoActions(width, height);
        this.image = undefined;
        this.updateEntireDrawingSurface(height, width);
    }

    updateUndoRedoActions(newWidth: number, newHeight: number): void {
        this.undoRedoService.setFirstResizeDimensions(newWidth, newHeight);
        this.undoRedoService.actions = [this.undoRedoService.actions[0]];
        this.undoRedoService.resizeActions = [this.undoRedoService.resizeActions[0]];
        this.undoRedoService.removedActions = [];
    }

    drawGrid(): void {
        const ctx = this.gridCtx;
        ctx.globalAlpha = (this.gridLinesOpacity * MAX_COLOR_INTENSITY) / (MAX_THICKNESS * MAX_COLOR_INTENSITY);
        this.clearCanvas(this.gridCtx);
        if (this.isGrid) {
            this.drawGridRows();
            this.drawGridColumns();
        }
    }

    drawGridRows(): void {
        const numberOfRows: number = (this.canvas.height - (this.canvas.height % this.gridSquareSize)) / this.gridSquareSize;
        for (let i = 0; i <= numberOfRows; i++) {
            this.gridCtx.beginPath();
            this.gridCtx.moveTo(0, i * this.gridSquareSize);
            this.gridCtx.lineTo(this.canvas.width, i * this.gridSquareSize);
            this.gridCtx.stroke();
        }
    }

    drawGridColumns(): void {
        const numberOfColumns: number = (this.canvas.width - (this.canvas.width % this.gridSquareSize)) / this.gridSquareSize;
        for (let i = 0; i <= numberOfColumns; i++) {
            this.gridCtx.beginPath();
            this.gridCtx.moveTo(i * this.gridSquareSize, 0);
            this.gridCtx.lineTo(i * this.gridSquareSize, this.canvas.height);
            this.gridCtx.stroke();
        }
    }
}
