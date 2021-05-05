import { Injectable } from '@angular/core';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class AutoSaveService {
    constructor(private drawingService: DrawingService) {}

    clearLocalStorage(): void {
        localStorage.clear();
    }

    autoSaveDrawing(): void {
        if (!this.drawingService.isCanvasEmpty(this.drawingService.baseCtx))
            localStorage.setItem('autoSaveDrawing', this.drawingService.canvas.toDataURL());
        else this.clearLocalStorage();
    }

    recoverAutoSaveDrawing(): void {
        const dataURL = localStorage.getItem('autoSaveDrawing') as string;
        const image = new Image();
        image.src = dataURL;
        image.onload = () => {
            this.drawingService.clearCanvas(this.drawingService.baseCtx);
            this.drawingService.baseCtx.canvas.width = image.width;
            this.drawingService.baseCtx.canvas.height = image.height;
            this.drawingService.previewCtx.canvas.width = image.width;
            this.drawingService.previewCtx.canvas.height = image.height;
            this.drawingService.canvasSize.x = image.width;
            this.drawingService.canvasSize.y = image.height;
            this.drawingService.baseCtx.drawImage(image, 0, 0);
            this.drawingService.previewCtx.drawImage(image, 0, 0);
            this.drawingService.image = image;
            this.drawingService.updateUndoRedoActions(image.width, image.height);
        };
    }

    isAutoSaveDrawingExists(): boolean {
        return Boolean(localStorage.getItem('autoSaveDrawing'));
    }
}
