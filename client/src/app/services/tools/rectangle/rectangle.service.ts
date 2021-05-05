import { Injectable } from '@angular/core';
import { ActionObject } from '@app/classes/action-object/action-object';
import { ActionShape } from '@app/classes/action-object/action-shape/action-shape';
import { Rectangle } from '@app/classes/shapes/rectangle/rectangle';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/constants/mouse-button';
import { ToolName } from '@app/constants/tool-name';
import { AttributeEditorService } from '@app/services/attribute-editor/attribute-editor.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class RectangleService extends Tool {
    private isShiftPressed: boolean;
    private currentMousePosition: Vec2;

    constructor(drawingService: DrawingService, private attributeEditorService: AttributeEditorService, private undoRedoService: UndoRedoService) {
        super(drawingService);
        this.name = ToolName.Rectangle;
        this.shape = new Rectangle(
            { x: 0, y: 0 },
            attributeEditorService.attributes,
            this.drawingService.getPrimaryColor(),
            this.drawingService.getSecondaryColor(),
        );
        this.isShiftPressed = false;
        this.currentMousePosition = { x: 0, y: 0 };
    }

    onKeyDown(event: KeyboardEvent): void {
        if (this.mouseDown) {
            if (event.shiftKey) {
                this.isShiftPressed = true;
                this.createRectangle();
            }
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (!event.shiftKey) {
            this.isShiftPressed = false;
            this.createRectangle();
        }
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.shape = new Rectangle(
                this.mouseDownCoord,
                this.attributeEditorService.attributes,
                this.drawingService.getPrimaryColor(),
                this.drawingService.getSecondaryColor(),
            );
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            const actionShape: ActionObject = new ActionShape(this.shape);
            this.undoRedoService.addAction(actionShape);
        }
        this.mouseDown = false;
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.currentMousePosition = this.getPositionFromMouse(event);
            this.createRectangle();
        }
    }

    createRectangle(): void {
        if (this.mouseDown) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.shape.updateDimensions(this.currentMousePosition, this.isShiftPressed);
            this.shape.draw(this.drawingService.previewCtx);
        }
    }
}
