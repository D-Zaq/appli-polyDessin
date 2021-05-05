import { Injectable } from '@angular/core';
import { Tool } from '@app/classes/tool';
import { MouseButton } from '@app/constants/mouse-button';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectionService } from '@app/services/selection/selection.service';

@Injectable({
    providedIn: 'root',
})
export class ClipboardService extends Tool {
    constructor(drawingService: DrawingService, public selectionService: SelectionService) {
        super(drawingService);
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Delete') this.delete();
        else if (event.ctrlKey) {
            switch (event.key) {
                case 'x':
                case 'X':
                    this.cut();
                    break;
                case 'c':
                case 'C':
                    this.copy();
                    break;
                case 'v':
                case 'V':
                    this.paste();
                    break;
            }
        }
    }

    applyAction(actionType: string): void {
        switch (actionType) {
            case 'Cut':
                this.cut();
                break;
            case 'Copy':
                this.copy();
                break;
            case 'Delete':
                this.delete();
                break;
            case 'Paste':
                this.paste();
        }
    }

    cut(): void {
        if (this.selectionService.isSelected) {
            this.selection = this.selectionService.selection;
            this.selectionService.onInit();
        }
    }

    delete(): void {
        if (this.selectionService.isSelected) {
            this.selectionService.onInit();
        }
    }

    copy(): void {
        if (this.selectionService.isSelected) {
            this.selection = this.selectionService.selection;
        }
    }

    paste(): void {
        if (this.selection) {
            const mouseEventLClick = {
                offsetX: 0,
                offsetY: 0,
                button: MouseButton.Left,
            } as MouseEvent;

            if (this.selectionService.isSelected) {
                this.selectionService.mouseDown = true;
                this.selectionService.onMouseDown(mouseEventLClick);
                this.selectionService.onInit();
            }
            const INVERSE = -1;
            this.selectionService.selection = this.selection;
            const xDistance = INVERSE * this.selection.boundingBox.rectangle.x;
            const yDistance = INVERSE * this.selection.boundingBox.rectangle.y;
            this.selectionService.selection.updateDimensionsMove(xDistance, yDistance);
            this.selectionService.mouseDown = true;
            this.selectionService.setCurrentMousePosition({ x: -1, y: -1 });
            this.selectionService.onMouseUp(mouseEventLClick);
            this.selectionService.setIsDragging(true);
        }
    }
}
