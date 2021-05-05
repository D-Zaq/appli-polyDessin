import { ActionObject } from '@app/classes/action-object/action-object';
import { DrawingService } from '@app/services/drawing/drawing.service';

export class ActionResize extends ActionObject {
    canvasWidth: number;
    canvasHeight: number;
    img: HTMLImageElement;

    constructor(canvasWidth: number, canvasHeight: number) {
        super();
        this.canvasHeight = canvasHeight;
        this.canvasWidth = canvasWidth;
        this.img = new Image();
    }

    execute(drawingService: DrawingService): void {
        const imgDataUrl = drawingService.canvas.toDataURL();

        drawingService.baseCtx.canvas.width = this.canvasWidth;
        drawingService.baseCtx.canvas.height = this.canvasHeight;
        drawingService.previewCtx.canvas.width = this.canvasWidth;
        drawingService.previewCtx.canvas.height = this.canvasHeight;
        drawingService.canvasSize.x = this.canvasWidth;
        drawingService.canvasSize.y = this.canvasHeight;

        this.img.src = imgDataUrl;
        this.img.onload = () => {
            drawingService.baseCtx.drawImage(this.img, 0, 0);
            drawingService.previewCtx.drawImage(this.img, 0, 0);
        };
    }
}
