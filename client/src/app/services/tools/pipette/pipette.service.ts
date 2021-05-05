import { Injectable } from '@angular/core';
import { Rectangle } from '@app/classes/shapes/rectangle/rectangle';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { ToolName } from '@app/constants/tool-name';
import { AttributeEditorService } from '@app/services/attribute-editor/attribute-editor.service';
import { ColorHistoryService } from '@app/services/color/color-history/color-history.service';
import { ColorPickerService } from '@app/services/color/color-picker/color-picker.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class PipetteService extends Tool {
    ctx: CanvasRenderingContext2D;
    zoomCanvas: HTMLCanvasElement;
    PIXELS_ZOOM: number = 15;
    SIZE: number = 200;
    MIDDLE: number = 10;
    SIZE_CURSOR: number = 2;
    ALPHA_INDEX: number = 4;
    currentMousePosition: Vec2 = { x: 0, y: 0 };
    MAX_INTEGER: number = 255;
    LEFT_OFFSET: number = 4;
    RIGHT_OFFSET: number = 8;

    constructor(
        drawingService: DrawingService,
        private attributeEditorService: AttributeEditorService,
        private colorPickerService: ColorPickerService,
        private colorHistoryService: ColorHistoryService,
    ) {
        super(drawingService);
        this.shape = new Rectangle(
            { x: 0, y: 0 },
            this.attributeEditorService.attributes,
            this.drawingService.getPrimaryColor(),
            this.drawingService.getSecondaryColor(),
        );
        this.name = ToolName.Pipette;
        this.mouseDown = false;
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = true;
        if (event.button === 2) {
            this.colorPickerService.invertColors();
        }
        this.currentMousePosition = this.getPositionFromMouse(event);
        this.getColorPixel();
        this.getZoomData();
        if (event.button === 2) {
            this.colorPickerService.invertColors();
        }
    }

    onMouseMove(event: MouseEvent): void {
        this.currentMousePosition = this.getPositionFromMouse(event);
        this.getZoomData();
    }

    getData(): ImageData {
        const imageData: ImageData = this.drawingService.baseCtx.getImageData(
            this.currentMousePosition.x - this.PIXELS_ZOOM / 2,
            this.currentMousePosition.y - this.PIXELS_ZOOM / 2,
            this.PIXELS_ZOOM,
            this.PIXELS_ZOOM,
        );
        const ARRAY_SIZE = 4;
        for (let i = 0; i < imageData.data.length; i += ARRAY_SIZE) {
            const position = i / ARRAY_SIZE;
            const x = position % imageData.width;
            const y = Math.floor(position / imageData.width);
            if (
                imageData.data[i] === 0 &&
                imageData.data[i + 1] === 0 &&
                imageData.data[i + 2] === 0 &&
                imageData.data[i + ARRAY_SIZE - 1] === 0 &&
                x > this.LEFT_OFFSET - this.currentMousePosition.x &&
                x + this.currentMousePosition.x < this.drawingService.canvasSize.x + this.RIGHT_OFFSET &&
                y > this.LEFT_OFFSET - this.currentMousePosition.y &&
                y + this.currentMousePosition.y < this.drawingService.canvasSize.y + this.RIGHT_OFFSET
            ) {
                imageData.data[i] = this.MAX_INTEGER;
                imageData.data[i + 1] = this.MAX_INTEGER;
                imageData.data[i + 2] = this.MAX_INTEGER;
                imageData.data[i + ARRAY_SIZE - 1] = this.MAX_INTEGER;
            }
        }
        return imageData;
    }
    newCanvas(): HTMLCanvasElement {
        const oc = document.createElement('canvas');
        const zoomData = this.getData();
        const octx = oc.getContext('2d');
        oc.width = this.PIXELS_ZOOM;
        oc.height = this.PIXELS_ZOOM;
        if (octx !== null) {
            octx.putImageData(zoomData, 0, 0);
        }
        return oc;
    }

    getZoomData(): void {
        this.ctx.clearRect(0, 0, this.SIZE, this.SIZE);
        this.ctx.save();
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.scale(this.SIZE / this.PIXELS_ZOOM, this.SIZE / this.PIXELS_ZOOM);
        this.ctx.drawImage(this.newCanvas(), 0, 0);
        this.ctx.stroke();
        this.ctx.restore();
        this.highlightMiddlePixel();
    }

    highlightMiddlePixel(): void {
        const HALF = this.SIZE / 2;
        const gradient = this.ctx.createLinearGradient(HALF - this.MIDDLE, HALF - this.MIDDLE, HALF + this.MIDDLE, HALF + this.MIDDLE);
        gradient.addColorStop(0, 'green');
        gradient.addColorStop(1 / 2, 'red');
        gradient.addColorStop(1.0, 'green');
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = this.SIZE_CURSOR;
        this.ctx.strokeRect(HALF - this.MIDDLE, HALF - this.MIDDLE, 2 * this.MIDDLE, 2 * this.MIDDLE);
    }

    getColorPixel(): void {
        const sliceSize = 6;
        const pixelData = this.drawingService.baseCtx.getImageData(this.currentMousePosition.x, this.currentMousePosition.y, 1, 1).data;
        if (pixelData[0] === 0 && pixelData[1] === 0 && pixelData[2] === 0 && pixelData[this.ALPHA_INDEX - 1] === 0) {
            this.colorPickerService.addColor('#FFFFFF', 'primaryColor');
        }
        if (pixelData[this.ALPHA_INDEX - 1] !== 0) {
            // (RGBA)-> alpha != 0
            const hex = '#' + ('000000' + this.rgbToHex(pixelData[0], pixelData[1], pixelData[2])).slice(-sliceSize);
            this.colorPickerService.addColor(hex, 'primaryColor');
        }
        this.colorHistoryService.drawColorHistory();
    }

    rgbToHex(r: number, g: number, b: number): string {
        const MAX_INTEGER = 255;
        if (r > MAX_INTEGER || g > MAX_INTEGER || b > MAX_INTEGER) {
            throw new Error('Invalid color component');
        }
        // tslint:disable-next-line: no-bitwise // Reason: Simplifies code to one clear line
        return ((r << 16) | (g << 8) | b).toString(16);
    }

    onMouseUp(event: MouseEvent): void {
        if (!this.mouseDown) {
            this.ctx.clearRect(0, 0, this.SIZE, this.SIZE);
        }
        this.mouseDown = false;
    }

    onInit(canvas: HTMLCanvasElement): void {
        this.zoomCanvas = canvas;
        this.ctx = this.zoomCanvas.getContext('2d') as CanvasRenderingContext2D;
    }
}
