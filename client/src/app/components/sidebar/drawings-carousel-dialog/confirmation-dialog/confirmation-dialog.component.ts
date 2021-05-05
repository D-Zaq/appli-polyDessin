import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Drawing } from '@common/communication/drawing';

@Component({
    selector: 'app-confirmation-dialog',
    templateUrl: './confirmation-dialog.component.html',
    styleUrls: ['./confirmation-dialog.component.scss'],
})
export class ConfirmationDialogComponent {
    constructor(public drawingService: DrawingService, public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: { drawingData: Drawing }) {}

    openDrawing(): void {
        const image = new Image();
        image.src = this.data.drawingData.url;
        this.drawingService.baseCtx.canvas.width = image.width;
        this.drawingService.baseCtx.canvas.height = image.height;
        this.drawingService.previewCtx.canvas.width = image.width;
        this.drawingService.previewCtx.canvas.height = image.height;
        this.drawingService.canvasSize.x = image.width;
        this.drawingService.canvasSize.y = image.height;
        // this.drawingService.updateEntireDrawingSurface(image.width, image.height);
        image.onload = () => {
            this.drawingService.clearCanvas(this.drawingService.baseCtx);
            this.drawingService.baseCtx.drawImage(image, 0, 0);
            this.drawingService.previewCtx.drawImage(image, 0, 0);
            this.drawingService.image = image;
            this.drawingService.updateUndoRedoActions(image.width, image.height);
            this.dialog.closeAll();
        };
    }
}
