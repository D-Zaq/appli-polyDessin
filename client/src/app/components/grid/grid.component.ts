import { Component } from '@angular/core';
import { MatSliderChange } from '@angular/material/slider';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Component({
    selector: 'app-grid-option',
    templateUrl: './grid.component.html',
    styleUrls: ['./grid.component.scss'],
})
export class GridComponent {
    constructor(public drawingService: DrawingService) {}

    drawGrid(): void {
        this.drawingService.isGrid = !this.drawingService.isGrid;
        this.drawingService.drawGrid();
    }

    setGridSize(event: MatSliderChange): void {
        this.drawingService.gridSquareSize = event.value !== null ? event.value : 0;
        event.value = this.drawingService.gridSquareSize;
        this.drawingService.drawGrid();
    }

    setGridOpacity(event: MatSliderChange): void {
        if (event.value !== null) {
            this.drawingService.gridLinesOpacity = event.value;
            this.drawingService.drawGrid();
        }
    }
}
