import { Component } from '@angular/core';
import { AutoSaveService } from '@app/services/auto-save/auto-save.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Component({
    selector: 'app-create-new-drawing-dialog',
    templateUrl: './create-new-drawing-dialog.component.html',
    styleUrls: ['./create-new-drawing-dialog.component.scss'],
})
export class CreateNewDrawingDialogComponent {
    constructor(private drawingService: DrawingService, private automaticSavingService: AutoSaveService) {}

    clearCanvas(windowInnerWidth: number, windowInnerHeight: number): void {
        this.automaticSavingService.clearLocalStorage();
        this.drawingService.clearCanvas(this.drawingService.baseCtx);
        this.drawingService.newCanvasInitialSize(windowInnerWidth, windowInnerHeight);
    }

    get windowInnerWidth(): number {
        return window.innerWidth;
    }

    get windowInnerHeight(): number {
        return window.innerHeight;
    }
}
