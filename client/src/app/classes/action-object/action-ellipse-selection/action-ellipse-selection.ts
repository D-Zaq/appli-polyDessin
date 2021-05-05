import { ActionObject } from '@app/classes/action-object/action-object';
import { ImageMoveSelection } from '@app/classes/image-move-selection';
import { Ellipse } from '@app/classes/shapes/ellipse/ellipse';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from '@app/services/drawing/drawing.service';
export class ActionEllipseSelection extends ActionObject {
    ellipse: Ellipse;
    rectangleX: number;
    rectangleY: number;
    rectangleWidth: number;
    rectangleHeight: number;
    imageMoveSelect: ImageMoveSelection;
    clearImage: ImageData;

    constructor(ellipse: Ellipse, rectangleX: number, rectangleY: number, rectangleWidth: number, rectangleHeight: number) {
        super();
        this.ellipse = ellipse;
        this.rectangleX = rectangleX;
        this.rectangleY = rectangleY;
        this.rectangleWidth = rectangleWidth;
        this.rectangleHeight = rectangleHeight;
    }

    execute(drawingService: DrawingService): void {
        const width = this.rectangleWidth;
        const height = this.rectangleHeight;
        const xPos = this.rectangleX;
        const yPos = this.rectangleY;

        if (!this.clearImage) {
            const startRow = yPos;
            const limitRow = yPos + height;
            const startCol = xPos;
            const limitCol = xPos + width;
            const indexRed = 0;
            const indexGreen = 1;
            const indexBlue = 2;
            const indexAlpha = 3;
            const iterationNumber = 4;
            const maxValue = 255;
            let pixelCounter = 0;
            let positionPixel: Vec2;

            this.clearImage = drawingService.baseCtx.getImageData(xPos, yPos, width, height);
            for (let i = startRow; i < limitRow; i++) {
                for (let j = startCol; j < limitCol; j++) {
                    positionPixel = { x: j, y: i };
                    if (this.ellipse.contains(positionPixel)) {
                        this.clearImage.data[pixelCounter + indexRed] = maxValue;
                        this.clearImage.data[pixelCounter + indexGreen] = maxValue;
                        this.clearImage.data[pixelCounter + indexBlue] = maxValue;
                        this.clearImage.data[pixelCounter + indexAlpha] = maxValue;
                    }
                    pixelCounter += iterationNumber;
                }
            }
        }
        drawingService.baseCtx.putImageData(this.clearImage, xPos, yPos);

        if (this.imageMoveSelect) {
            if (this.imageMoveSelect.isImageFlippedHorizontally || this.imageMoveSelect.isImageFlippedVertically) {
                let newWidth = this.imageMoveSelect.width;
                let newHeight = this.imageMoveSelect.height;

                drawingService.baseCtx.save();
                drawingService.baseCtx.translate(this.imageMoveSelect.x, this.imageMoveSelect.y);
                // tslint:disable: no-magic-numbers // Reason: user-readable

                if (this.imageMoveSelect.isImageFlippedHorizontally) {
                    drawingService.baseCtx.scale(-1, 1);
                    newWidth = this.imageMoveSelect.width * -1;
                }
                if (this.imageMoveSelect.isImageFlippedVertically) {
                    drawingService.baseCtx.scale(1, -1);
                    newHeight = this.imageMoveSelect.height * -1;
                }
                drawingService.baseCtx.drawImage(this.imageMoveSelect.image, 0, 0, newWidth, newHeight);
                drawingService.baseCtx.restore();
            } else
                drawingService.baseCtx.drawImage(
                    this.imageMoveSelect.image,
                    this.imageMoveSelect.x,
                    this.imageMoveSelect.y,
                    this.imageMoveSelect.width,
                    this.imageMoveSelect.height,
                );
        }
    }

    setImageMoveSelect(imageMoveSelect: ImageMoveSelection): void {
        this.imageMoveSelect = imageMoveSelect;
    }

    getImageMoveSelect(): ImageMoveSelection {
        return this.imageMoveSelect;
    }
}
