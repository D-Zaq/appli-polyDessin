import { Injectable } from '@angular/core';
import { ActionObject } from '@app/classes/action-object/action-object';
import { ImageMoveSelection } from '@app/classes/image-move-selection';
import { EllipseSelection } from '@app/classes/selections/ellipse-selection/ellipse-selection';
import { RectangleSelection } from '@app/classes/selections/rectangle-selection/rectangle-selection';
import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DrawType } from '@app/constants/draw-type';
import { MouseButton } from '@app/constants/mouse-button';
import { ToolName } from '@app/constants/tool-name';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MoveSelectionService } from '@app/services/move-selection/move-selection.service';
import { ResizeSelectionService } from '@app/services/resize-selection/resize-selection.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class SelectionService extends Tool {
    private isShiftPressed: boolean;
    private currentMousePosition: Vec2;
    private attributes: ShapeAttribute;
    isSelected: boolean;

    constructor(
        drawingService: DrawingService,
        private moveSelectionService: MoveSelectionService,
        private undoRedoService: UndoRedoService,
        private resizeSelectionService: ResizeSelectionService,
    ) {
        super(drawingService);
        const strokeThickness = 0.5;
        this.attributes = new ShapeAttribute(strokeThickness, DrawType.Outline);
        this.isSelected = false;
    }

    onInit(toolName?: ToolName): void {
        if (toolName) this.name = toolName;
        const strokeThickness = 0.5;
        this.attributes = new ShapeAttribute(strokeThickness, DrawType.Outline);
        this.isSelected = false;
        this.moveSelectionService.isDragging = false;
        this.resizeSelectionService.isResizing = false;
        this.mouseDown = false;
        this.mouseDownCoord = { x: 0, y: 0 };
        this.currentMousePosition = this.mouseDownCoord;
        this.createSelection(this.mouseDownCoord);
    }

    createSelection(mousePosition: Vec2): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        switch (this.name) {
            case ToolName.RectangleSelection:
                this.selection = new RectangleSelection(mousePosition, this.attributes, 'black', 'black');
                break;
            case ToolName.EllipseSelection:
                this.selection = new EllipseSelection(mousePosition, this.attributes, 'black', 'black');
                break;
        }
    }

    // tslint:disable-next-line: cyclomatic-complexity :: Reason
    onKeyDown(event: KeyboardEvent): void {
        if (this.mouseDown) {
            if (!this.isSelected && event.shiftKey) {
                // Transforn shape to square or circle when pressing shift key
                this.isShiftPressed = true;
                this.drawSelection();
            } else if (this.resizeSelectionService.isResizing && event.shiftKey) {
                this.resizeSelectionService.onKeyDown(event);
            }
        } else if (event.key === 'Escape') {
            // Confirm selection
            if (this.moveSelectionService.isDragging || this.resizeSelectionService.isResizing) this.createImageMoveSelectObject();
            else this.undoRedoService.undoAction();
            this.onInit();
        } else if (this.isSelected && event.key.includes('Arrow')) {
            // Initialize moveSelectionService.selection
            if (!this.moveSelectionService.isDragging) this.moveSelectionService.onInit(this.selection);
            this.moveSelectionService.onKeyDown(event); // Move selection with arrows
        } else if (event.ctrlKey && (event.key === 'a' || event.key === 'A')) {
            event.preventDefault();
            this.selectAllPixels();
        }
    }

    selectAllPixels(): void {
        this.mouseDownCoord = { x: 0, y: 0 };
        this.selection = new RectangleSelection(this.mouseDownCoord, this.attributes, 'black', 'black');
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        const mousePosition: Vec2 = { x: this.drawingService.canvas.width, y: this.drawingService.canvas.height };
        this.selection.updateDimensions(mousePosition, this.isShiftPressed);
        this.selection.saveSelectedPixels(this.drawingService.baseCtx);
        this.selection.draw(this.drawingService.previewCtx);
        const action: ActionObject = this.selection.createActionObject();
        this.undoRedoService.addAction(action);
        this.isSelected = true;
    }

    onKeyUp(event: KeyboardEvent): void {
        if (this.mouseDown) {
            // Transform shape back to rectangle or ellipse when shift key is released
            if (!this.isSelected && !event.shiftKey) {
                this.isShiftPressed = false;
                this.drawSelection();
            } else if (this.resizeSelectionService.isResizing && !event.shiftKey) this.resizeSelectionService.onKeyUp(event);
        } else if (this.moveSelectionService.isDragging && event.key.includes('Arrow')) {
            // Stop moving selection with arrows
            this.moveSelectionService.onKeyUp(event);
        }
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.currentMousePosition = this.mouseDownCoord;
            // begin creating selection
            if (!this.isSelected) {
                this.createSelection(this.mouseDownCoord);
            } else {
                // If cursor is inside a controlPoint of the bounding box
                const controlPoint = this.selection.boundingBox.getControlPointPressed(this.mouseDownCoord);
                if (controlPoint) {
                    this.resizeSelectionService.onInit(this.selection, controlPoint);
                    this.resizeSelectionService.onMouseDown(event);
                }
                // if cursor is outside selection
                else if (!this.selection.boundingBox.contains(this.mouseDownCoord)) {
                    if (this.moveSelectionService.isDragging || this.resizeSelectionService.isResizing) this.createImageMoveSelectObject();
                    else this.undoRedoService.undoAction();
                    this.isSelected = false;
                    this.resizeSelectionService.isResizing = false;
                    this.moveSelectionService.isDragging = false;
                    this.createSelection(this.mouseDownCoord);
                } else {
                    // If cursor is inside the selection
                    this.resizeSelectionService.isResizing = false;
                    this.moveSelectionService.onInit(this.selection);
                    this.moveSelectionService.onMouseDown(event);
                }
            }
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown && this.currentMousePosition !== this.mouseDownCoord) {
            if (!this.isSelected) {
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.selection.resetLineDash(this.drawingService.previewCtx);
                this.selection.saveSelectedPixels(this.drawingService.baseCtx);
                this.selection.draw(this.drawingService.previewCtx);
                if (this.selection.boundingBox.rectangle.width !== 0 && this.selection.boundingBox.rectangle.height !== 0) {
                    const action: ActionObject = this.selection.createActionObject();
                    this.undoRedoService.addAction(action);
                    this.isSelected = true;
                }
            } else if (this.resizeSelectionService.isResizing) {
                this.resizeSelectionService.onMouseUp(event);
            }
        }
        this.mouseDown = false;
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.currentMousePosition = this.getPositionFromMouse(event);
            if (this.resizeSelectionService.isResizing) this.resizeSelectionService.onMouseMove(event);
            else this.moveSelectionService.isDragging ? this.moveSelectionService.onMouseMove(event) : this.drawSelection();
        }
    }

    drawSelection(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.selection.updateDimensions(this.currentMousePosition, this.isShiftPressed);
        this.selection.setLineDash(this.drawingService.previewCtx);
        this.selection.draw(this.drawingService.previewCtx);
    }

    createImageMoveSelectObject(): void {
        if (this.selection.boundingBox.rectangle.width !== 0 && this.selection.boundingBox.rectangle.height !== 0) {
            const imageMoveSelect: ImageMoveSelection = {
                x: this.selection.boundingBox.rectangle.x,
                y: this.selection.boundingBox.rectangle.y,
                width: this.selection.boundingBox.rectangle.width,
                height: this.selection.boundingBox.rectangle.height,
                image: this.selection.image,
                isImageFlippedHorizontally: this.selection.isImageFlippedHorizontally,
                isImageFlippedVertically: this.selection.isImageFlippedVertically,
            };
            this.undoRedoService.actions[this.undoRedoService.actions.length - 1].setImageMoveSelect(imageMoveSelect);
            this.undoRedoService.content.next(this.undoRedoService.actions);
        }
    }

    onToolChange(): void {
        if (this.isSelected) {
            this.undoRedoService.undoAction();
            this.onInit();
        }
    }

    setCurrentMousePosition(newPosition: Vec2): void {
        this.currentMousePosition = newPosition;
    }

    setIsDragging(newValue: boolean): void {
        this.moveSelectionService.isDragging = newValue;
    }
}
