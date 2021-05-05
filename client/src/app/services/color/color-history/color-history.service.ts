import { Injectable } from '@angular/core';
import { CircleColor } from '@app/classes/shapes/circle-color';
import { ColorPickerService } from '@app/services/color/color-picker/color-picker.service';
@Injectable({
    providedIn: 'root',
})
export class ColorHistoryService {
    ctx: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    RADIUS_SIZE: number = 10;
    circleColors: CircleColor[];

    constructor(private colorPickerService: ColorPickerService) {}

    onInit(canvas: HTMLCanvasElement): void {
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        this.circleColors = [];
    }

    drawColorHistory(): void {
        let xPos = 20;
        let yPos = 20;
        const interval = 30;
        const indexNewColumn = 5;
        const xPosNewColumn = 20;
        const yPosNewColumn = 60;
        this.colorPickerService.colors.forEach((color, i) => {
            if (i === indexNewColumn) {
                xPos = xPosNewColumn;
                yPos = yPosNewColumn;
            }
            const circleColor = { x: xPos, y: yPos, radius: this.RADIUS_SIZE, color };
            this.circleColors.push(circleColor);
            this.drawCircle(circleColor);
            xPos += interval;
        });
    }

    drawCircle(circleHist: CircleColor): void {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.ellipse(circleHist.x, circleHist.y, circleHist.radius, circleHist.radius, 0, 0, 2 * Math.PI);
        this.ctx.fillStyle = circleHist.color;
        this.ctx.strokeStyle = '#000000'; // black
        const lineWidth = 3;
        this.ctx.lineWidth = lineWidth;
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.restore();
    }

    onClick(x: number, y: number, typeClick: string): void {
        this.circleColors.forEach((circleColor) => {
            if (this.isPointInCircle(x, y, circleColor)) {
                if (typeClick === 'left') {
                    this.colorPickerService.setColor('left', circleColor.color);
                } else if (typeClick === 'right') {
                    this.colorPickerService.setColor('right', circleColor.color);
                }
            }
        });
    }

    isPointInCircle(x: number, y: number, circleColor: CircleColor): boolean {
        const distanceSquared = (x - circleColor.x) * (x - circleColor.x) + (y - circleColor.y) * (y - circleColor.y);
        return distanceSquared <= circleColor.radius * circleColor.radius;
    }
}
