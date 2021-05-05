import { Injectable } from '@angular/core';
import { ActionObject } from '@app/classes/action-object/action-object';
import { ActionShape } from '@app/classes/action-object/action-shape/action-shape';
import { Spraypaint } from '@app/classes/shapes/spraypaint/spraypaint';
import { Tool } from '@app/classes/tool';
import { MouseButton } from '@app/constants/mouse-button';
import { ToolName } from '@app/constants/tool-name';
import { AttributeEditorService } from '@app/services/attribute-editor/attribute-editor.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class SpraypaintService extends Tool {
    handle: ReturnType<typeof setTimeout>;
    constructor(drawingService: DrawingService, private attributeEditorService: AttributeEditorService, private undoRedoService: UndoRedoService) {
        super(drawingService);
        this.name = ToolName.Spraypaint;
        this.mouseDown = false;
        this.shape = new Spraypaint(
            { x: 0, y: 0 },
            attributeEditorService.attributes,
            this.drawingService.getPrimaryColor(),
            this.drawingService.getSecondaryColor(),
            this.attributeEditorService.attributes.dropletSize,
            this.attributeEditorService.attributes.strokeDiameter,
            this.attributeEditorService.attributes.strokeInterval,
        );
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            this.mouseDownCoord = this.getPositionFromMouse(event);
            this.shape = new Spraypaint(
                this.mouseDownCoord,
                this.attributeEditorService.attributes,
                this.drawingService.getPrimaryColor(),
                this.drawingService.getSecondaryColor(),
                this.attributeEditorService.attributes.dropletSize,
                this.attributeEditorService.attributes.strokeDiameter,
                this.attributeEditorService.attributes.strokeInterval,
            );
            this.shape.updateDraw(); // always updates at least once on mouse down
            this.shape.draw(this.drawingService.previewCtx);
            let waitTimeMs: number;
            const msPerSecond = 1000;
            waitTimeMs = msPerSecond / this.shape.attributes.strokeInterval;
            this.handle = setInterval(() => {
                this.shape.updateDraw();
                this.shape.draw(this.drawingService.previewCtx);
            }, waitTimeMs);
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.mouseDown) {
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            const actionShape: ActionObject = new ActionShape(this.shape);
            this.undoRedoService.addAction(actionShape);
        }
        this.mouseDown = false;
        window.clearInterval(this.handle);
    }

    onMouseMove(event: MouseEvent): void {
        if (this.mouseDown) {
            this.shape.updateStroke(this.getPositionFromMouse(event));
        }
    }
}
