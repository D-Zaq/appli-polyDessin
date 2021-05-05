import { Injectable } from '@angular/core';
import { ActionObject } from '@app/classes/action-object/action-object';
import { ActionShape } from '@app/classes/action-object/action-shape/action-shape';
import { Stamp } from '@app/classes/shapes/stamp/stamp';
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
export class StampService extends Tool {
    private currentMousePosition: Vec2;
    constructor(drawingService: DrawingService, private attributeEditorService: AttributeEditorService, private undoRedoService: UndoRedoService) {
        super(drawingService);
        this.name = ToolName.Stamp;
        this.shape = new Stamp({ x: 0, y: 0 }, this.attributeEditorService.attributes);
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
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
        this.currentMousePosition = this.getPositionFromMouse(event);
        this.drawingService.clearCanvas(this.drawingService.previewCtx);

        if (this.shape.attributes.stampImage !== this.attributeEditorService.attributes.stampImage)
            this.shape.attributes.stampImage = this.attributeEditorService.attributes.stampImage;

        this.shape.updateDimensions(this.currentMousePosition, false);
        this.shape.draw(this.drawingService.previewCtx);
    }
}
