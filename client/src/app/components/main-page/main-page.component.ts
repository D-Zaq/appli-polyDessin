import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreateNewDrawingDialogComponent } from '@app/components/sidebar/create-new-drawing-dialog/create-new-drawing-dialog.component';
import { DrawingsCarouselDialogComponent } from '@app/components/sidebar/drawings-carousel-dialog/drawings-carousel-dialog.component';
import { AutoSaveService } from '@app/services/auto-save/auto-save.service';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string = 'PolyDessin 2';

    constructor(private drawingService: DrawingService, private autoSaveService: AutoSaveService, public dialog: MatDialog) {}

    createNewDrawing(windowInnerWidth: number, windowInnerHeight: number): void {
        if (!this.autoSaveService.isAutoSaveDrawingExists()) {
            this.drawingService.newCanvasInitialSize(windowInnerWidth, windowInnerHeight);
        } else {
            this.drawingService.isCreateNewDrawingDialogOpen = true;
            this.dialog
                .open(CreateNewDrawingDialogComponent)
                .afterClosed()
                .subscribe(() => {
                    this.drawingService.isCreateNewDrawingDialogOpen = false;
                });
        }
    }

    openDrawingsCarouselDialog(): void {
        this.drawingService.isDrawingsCarouselDialogOpen = true;
        this.dialog
            .open(DrawingsCarouselDialogComponent, {
                width: '1250px',
                height: 'auto',
            })
            .afterClosed()
            .subscribe(() => {
                this.drawingService.isDrawingsCarouselDialogOpen = false;
            });
    }

    continueDrawing(): void {
        this.autoSaveService.recoverAutoSaveDrawing();
    }

    isContinueDrawingPossible(): boolean {
        return this.autoSaveService.isAutoSaveDrawingExists();
    }

    get windowInnerWidth(): number {
        return window.innerWidth;
    }

    get windowInnerHeight(): number {
        return window.innerHeight;
    }
}
