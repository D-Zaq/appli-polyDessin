import { Injectable } from '@angular/core';
import { ActionObject } from '@app/classes/action-object/action-object';
import { BoundingBox } from '@app/classes/selections/bounding-box/bounding-box';
import { LassoPolygonalSelection } from '@app/classes/selections/lasso-polygonal-selection/lasso-polygonal-selection';
import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { Vec2 } from '@app/classes/vec2';
import { NB_PIXEL } from '@app/constants/constants';
import { DrawType } from '@app/constants/draw-type';
import { ToolName } from '@app/constants/tool-name';
import { AttributeEditorService } from '@app/services/attribute-editor/attribute-editor.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { SelectionService } from '@app/services/selection/selection.service';
import { LineService } from '@app/services/tools/line/line.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class LassoPolygonalService extends LineService {
    // private currentMousePosition: Vec2;
    private attributes: ShapeAttribute;
    private pathData: Vec2[];
    lassoPolygonalSelection: LassoPolygonalSelection;
    numberOfPixels: number;
    mouseDown: boolean;
    closed: boolean;
    boundingBox: BoundingBox;

    constructor(
        drawingService: DrawingService,
        undoRedoService: UndoRedoService,
        attributesEditor: AttributeEditorService,
        private selectionService: SelectionService,
    ) {
        super(drawingService, attributesEditor, undoRedoService);
        this.onInit(ToolName.LassoPolygonal);
    }

    onInit(toolName?: ToolName): void {
        if (toolName) this.name = toolName;
        const strokeThickness = 5;
        this.attributes = new ShapeAttribute(strokeThickness, DrawType.OutlineFill);
        this.numberOfPixels = NB_PIXEL;
        this.closed = false;
        this.boundingBox = new BoundingBox({ x: 0, y: 0 }, {} as ShapeAttribute, 'black', 'black');
    }

    onKeyDown(event: KeyboardEvent): void {
        if (!this.closed) super.onKeyDown(event);
        else this.selectionService.onKeyDown(event);
    }

    onKeyUp(event: KeyboardEvent): void {
        if (!this.closed) super.onKeyUp(event);
        else this.selectionService.onKeyUp(event);
    }

    onMouseDown(event: MouseEvent): void {
        const minimalSize = 4;
        const numberOfPixels = 20;
        if (!this.closed) {
            super.onMouseDown(event);

            if (
                this.shape.getPathData().length >= minimalSize &&
                this.shape.calculateDistance(this.shape.getPathData()[0], this.shape.getPathData()[this.shape.getPathData().length - 1]) <=
                    numberOfPixels
            ) {
                this.pathData = this.shape.getPathData();
                // we will close the path
                super.onDblClick(event);
                this.closed = true;

                this.gettingTheDimensions();
                this.selection = new LassoPolygonalSelection({ x: 0, y: 0 }, this.attributes, 'black', 'black', this.pathData);
                this.selection.boundingBox = this.boundingBox;
                this.selectionService.onInit(ToolName.LassoPolygonal);
                this.selectionService.selection = this.selection;
                this.selectionService.isSelected = true;
                this.selectionService.selection.saveSelectedPixels(this.drawingService.baseCtx);
                this.selection.draw(this.drawingService.previewCtx);

                const action: ActionObject = this.selectionService.selection.createActionObject();
                this.undoRedoService.addAction(action);
            }
        } else {
            this.selectionService.onMouseDown(event);
            if (!this.selectionService.isSelected) this.closed = false;
        }
    }

    onMouseUp(event: MouseEvent): void {
        if (this.closed) this.selectionService.onMouseUp(event);
    }

    onMouseMove(event: MouseEvent): void {
        if (!this.closed) super.onMouseMove(event);
        else this.selectionService.onMouseMove(event);
    }

    private gettingTheDimensions(): void {
        let leftPos = 2000;
        let rightPos = 0;
        let topPos = 20000;
        let bottomPos = 0;
        let height = 0;
        let width = 0;

        this.pathData.forEach((point) => {
            if (point.x < leftPos) {
                leftPos = point.x;
            } else if (point.x > rightPos) {
                rightPos = point.x;
            }
            if (point.y > bottomPos) {
                bottomPos = point.y;
            } else if (point.y < topPos) {
                topPos = point.y;
            }
        });
        width = rightPos - leftPos;
        height = bottomPos - topPos;

        this.boundingBox.rectangle.width = width;
        this.boundingBox.rectangle.height = height;
        this.boundingBox.rectangle.x = leftPos;
        this.boundingBox.rectangle.y = topPos;
        this.boundingBox.updateControlPoints();
    }

    onToolChange(): void {
        if (this.closed) {
            this.undoRedoService.undoAction();
            this.onInit();
        }
    }
}
