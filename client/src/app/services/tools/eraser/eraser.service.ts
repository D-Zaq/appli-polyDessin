import { Injectable } from '@angular/core';
import { ActionShape } from '@app/classes/action-object/action-shape/action-shape';
import { EraserStroke } from '@app/classes/shapes/eraser-stroke/eraser-stroke';
import { Tool } from '@app/classes/tool';
import { MouseButton } from '@app/constants/mouse-button';
import { ToolName } from '@app/constants/tool-name';
import { AttributeEditorService } from '@app/services/attribute-editor/attribute-editor.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
@Injectable({
    providedIn: 'root',
})
export class EraserService extends Tool {
    constructor(drawingService: DrawingService, private attributeEditorService: AttributeEditorService, private undoRedoService: UndoRedoService) {
        super(drawingService);
        this.name = ToolName.Eraser;
        this.shape = new EraserStroke(this.attributeEditorService.attributes, 'white', 'black');
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.shape = new EraserStroke(this.attributeEditorService.attributes, 'white', 'black');

            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.shape.updateStroke(this.mouseDownCoord);
            this.shape.draw(this.drawingService.previewCtx);
            this.shape.drawPerimeter(this.drawingService.previewCtx);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.undoRedoService.addAction(new ActionShape(this.shape));
        }
        this.mouseDown = false;
    }

    onMouseMove(event: MouseEvent): void {
        const mousePosition = this.getPositionFromMouse(event);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        if (this.mouseDown) {
            this.shape.updateStroke(mousePosition);
            this.shape.draw(this.drawingService.previewCtx);
        }
        this.shape.updatePositionEraser(mousePosition);
        this.shape.drawPerimeter(this.drawingService.previewCtx);
    }
}
