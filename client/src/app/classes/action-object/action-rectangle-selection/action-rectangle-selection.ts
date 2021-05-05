import { ActionObject } from '@app/classes/action-object/action-object';
import { ImageMoveSelection } from '@app/classes/image-move-selection';
import { DrawingService } from '@app/services/drawing/drawing.service';
export class ActionRectangleSelection extends ActionObject {
    x: number;
    y: number;
    width: number;
    height: number;
    imageMoveSelect: ImageMoveSelection;

    constructor(x: number, y: number, width: number, height: number) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    execute(drawingService: DrawingService): void {
        drawingService.baseCtx.clearRect(this.x, this.y, this.width, this.height);

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
