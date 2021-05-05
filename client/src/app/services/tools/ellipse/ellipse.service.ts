import { Injectable } from '@angular/core';
import { ActionObject } from '@app/classes/action-object/action-object';
import { ActionShape } from '@app/classes/action-object/action-shape/action-shape';
import { Ellipse } from '@app/classes/shapes/ellipse/ellipse';
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
export class EllipseService extends Tool {
    private isShiftPressed: boolean;
    private currMousePosition: Vec2;

    constructor(drawingService: DrawingService, private attributeEditorService: AttributeEditorService, private undoRedoService: UndoRedoService) {
        super(drawingService);
        this.shape = new Ellipse(
            { x: 0, y: 0 },
            this.attributeEditorService.attributes,
            this.drawingService.getPrimaryColor(),
            this.drawingService.getSecondaryColor(),
        );
        this.isShiftPressed = false;
        this.name = ToolName.Ellipse;
        this.currMousePosition = { x: 0, y: 0 };
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.shape = new Ellipse(
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
            this.currMousePosition = this.getPositionFromMouse(event);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.shape.updateDimensions(this.currMousePosition, this.isShiftPressed);
            this.shape.draw(this.drawingService.previewCtx);
            this.shape.drawPerimeter(this.drawingService.previewCtx);
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (!event.shiftKey) {
            this.isShiftPressed = false;
            if (this.mouseDown) {
                this.shape.updateDimensions(this.currMousePosition, this.isShiftPressed);
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.shape.draw(this.drawingService.previewCtx);
                this.shape.drawPerimeter(this.drawingService.previewCtx);
            }
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        if (this.mouseDown) {
            if (event.shiftKey) {
                this.isShiftPressed = true;
                this.shape.updateDimensions(this.currMousePosition, this.isShiftPressed);
                this.drawingService.clearCanvas(this.drawingService.previewCtx);
                this.shape.draw(this.drawingService.previewCtx);
                this.shape.drawPerimeter(this.drawingService.previewCtx);
            }
        }
    }
}
