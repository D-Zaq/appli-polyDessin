import { Injectable } from '@angular/core';
import { ActionObject } from '@app/classes/action-object/action-object';
import { ActionShape } from '@app/classes/action-object/action-shape/action-shape';
import { PencilStroke } from '@app/classes/shapes/pencil-stroke/pencil-stroke';
import { Tool } from '@app/classes/tool';
import { MouseButton } from '@app/constants/mouse-button';
import { ToolName } from '@app/constants/tool-name';
import { AttributeEditorService } from '@app/services/attribute-editor/attribute-editor.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
@Injectable({
    providedIn: 'root',
})
export class PencilService extends Tool {
    constructor(drawingService: DrawingService, private attributeEditorService: AttributeEditorService, private undoRedoService: UndoRedoService) {
        super(drawingService);
        this.name = ToolName.Pencil;
        this.shape = new PencilStroke(this.attributeEditorService.attributes, this.drawingService.getPrimaryColor(), '');
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.shape = new PencilStroke(this.attributeEditorService.attributes, this.drawingService.getPrimaryColor(), '');

            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.shape.updateStroke(this.mouseDownCoord);
            this.shape.draw(this.drawingService.previewCtx);
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
            const mousePosition = this.getPositionFromMouse(event);
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.shape.updateStroke(mousePosition);
            this.shape.draw(this.drawingService.previewCtx);
        }
    }
}
