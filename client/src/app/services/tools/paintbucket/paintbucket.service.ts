import { Injectable } from '@angular/core';
import { ActionObject } from '@app/classes/action-object/action-object';
import { ActionShape } from '@app/classes/action-object/action-shape/action-shape';
import { Paintbucket } from '@app/classes/shapes/paintbucket/paintbucket';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { ALPHA_INDEX, BLUE_INDEX, MAX_DIFF, MAX_INDEX, MAX_PERCENT } from '@app/constants/constants';
import { ToolName } from '@app/constants/tool-name';
import { AttributeEditorService } from '@app/services/attribute-editor/attribute-editor.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class PaintbucketService extends Tool {
    constructor(drawingService: DrawingService, private attributeEditorService: AttributeEditorService, private undoRedoService: UndoRedoService) {
        super(drawingService);
        this.name = ToolName.PaintBucket;
        this.currentMousePosition = { x: 0, y: 0 };
        this.shape = new Paintbucket(
            this.currentMousePosition,
            attributeEditorService.attributes,
            this.drawingService.getPrimaryColor(),
            this.drawingService.getSecondaryColor(),
        );
    }
    private mousePositionRGB: number[];
    private currentMousePosition: Vec2;
    private data: ImageData;

    onMouseDown(event: MouseEvent): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.currentMousePosition = this.getPositionFromMouse(event);
        this.shape = new Paintbucket(
            this.currentMousePosition,
            this.attributeEditorService.attributes,
            this.drawingService.getPrimaryColor(),
            this.drawingService.getSecondaryColor(),
        );
        this.data = this.drawingService.baseCtx.getImageData(
            0,
            0,
            this.drawingService.baseCtx.canvas.width,
            this.drawingService.baseCtx.canvas.height,
        );
        switch (event.button) {
            case 2: {
                this.rightClick();
                break;
            }
            case 0: {
                this.leftClick();
                break;
            }
            default: {
                return; // do nothing
            }
        }
        const actionShape: ActionObject = new ActionShape(this.shape);
        this.undoRedoService.addAction(actionShape);
    }
    compareRGB(pixelToCheck: number[]): boolean {
        let colourDistance = 0;
        for (let k = 0; k < BLUE_INDEX; k++) {
            colourDistance += Math.pow(pixelToCheck[k] - this.mousePositionRGB[k], 2);
        }
        if ((colourDistance * MAX_PERCENT) / MAX_DIFF > this.attributeEditorService.attributes.tolerance) {
            return false;
        }
        return true;
    }

    rightClick(): void {
        let i: number;
        let j: number;
        const similarColorPixels: Vec2[] = new Array();
        this.mousePositionRGB = this.getRGB(this.currentMousePosition.x, this.currentMousePosition.y);
        for (i = 0; i < this.data.width; i++) {
            for (j = 0; j < this.data.height; j++) {
                if (this.compareRGB(this.getRGB(i, j))) {
                    similarColorPixels.push({ x: i, y: j });
                }
            }
        }
        this.shape.sendVec2Array(similarColorPixels);
        this.shape.draw(this.drawingService.baseCtx);
    }

    getRGB(x: number, y: number): number[] {
        const index = y * ALPHA_INDEX * this.data.width + x * ALPHA_INDEX;
        const RGB: number[] = new Array();
        for (let i = 0; i < ALPHA_INDEX; i++) {
            RGB[i] = this.data.data[index + i];
        }
        if (RGB[BLUE_INDEX] === 0 && RGB[0] === 0 && RGB[1] === 0 && RGB[2] === 0) {
            for (let i = 0; i < ALPHA_INDEX; i++) {
                RGB[i] = MAX_INDEX;
            }
        }
        for (let i = 0; i < BLUE_INDEX; i++) {
            RGB[i] *= RGB[BLUE_INDEX] / MAX_INDEX;
        }
        return RGB;
    }

    leftClick(): void {
        const similarColorPixels: Vec2[] = new Array();
        this.mousePositionRGB = this.getRGB(this.currentMousePosition.x, this.currentMousePosition.y);
        let array: boolean[][];
        array = [];
        for (let i = 0; i < this.data.width; i++) {
            array[i] = [];
            for (let j = 0; j < this.data.height; j++) {
                array[i][j] = false;
            }
        }
        const pixelsToCheck: Vec2[] = new Array();

        pixelsToCheck.push({ x: this.currentMousePosition.x, y: this.currentMousePosition.y });
        similarColorPixels.push({ x: this.currentMousePosition.x, y: this.currentMousePosition.y });
        while (true) {
            const currentPixel: Vec2 | undefined = pixelsToCheck.pop();
            if (currentPixel === undefined) break;
            if (
                currentPixel.x >= 0 &&
                currentPixel.y >= 0 &&
                currentPixel.x < this.data.width &&
                currentPixel.y < this.data.height &&
                array[currentPixel.x][currentPixel.y] !== true
            ) {
                array[currentPixel.x][currentPixel.y] = true;
                if (this.compareRGB(this.getRGB(currentPixel.x, currentPixel.y))) {
                    similarColorPixels.push(currentPixel);
                    pixelsToCheck.push({ x: currentPixel.x, y: currentPixel.y + 1 });
                    pixelsToCheck.push({ x: currentPixel.x, y: currentPixel.y - 1 });
                    pixelsToCheck.push({ x: currentPixel.x + 1, y: currentPixel.y });
                    pixelsToCheck.push({ x: currentPixel.x - 1, y: currentPixel.y });
                }
            }
        }
        this.shape.sendVec2Array(similarColorPixels);
        this.shape.draw(this.drawingService.baseCtx);
    }

    pixelIsAlreadyInArray(currentPixel: Vec2, similarColorPixels: Vec2[]): boolean {
        for (const currentVector of similarColorPixels) {
            if (currentVector.x === currentPixel.x && currentVector.y === currentPixel.y) {
                return true;
            }
        }
        return false;
    }
}
