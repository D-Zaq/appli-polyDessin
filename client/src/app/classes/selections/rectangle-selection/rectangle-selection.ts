import { ActionObject } from '@app/classes/action-object/action-object';
import { ActionRectangleSelection } from '@app/classes/action-object/action-rectangle-selection/action-rectangle-selection';
import { BoundingBox } from '@app/classes/selections/bounding-box/bounding-box';
import { Selection } from '@app/classes/selections/selection';
import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { Vec2 } from '@app/classes/vec2';

export class RectangleSelection extends Selection {
    constructor(mouseDownCoord: Vec2, attributes: ShapeAttribute, primaryColor: string, secondaryColor: string) {
        const boundingBox = new BoundingBox(mouseDownCoord, attributes, primaryColor, secondaryColor);
        super(boundingBox);
    }
    updateDimensions(mousePosition: Vec2, isShiftPressed?: boolean): void {
        this.boundingBox.updateDimensions(mousePosition, isShiftPressed);
    }

    setLineDash(ctx: CanvasRenderingContext2D): void {
        const firstDash = 10;
        const lastDash = 20;
        if (!this.previousLineDash) this.previousLineDash = ctx.getLineDash();

        ctx.setLineDash([firstDash, lastDash]);
    }

    resetLineDash(ctx: CanvasRenderingContext2D): void {
        if (this.previousLineDash) ctx.setLineDash(this.previousLineDash);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (this.imageData) this.drawImage(ctx);
        this.boundingBox.draw(ctx);
    }

    contains(mouseDownCoord: Vec2): boolean {
        return this.boundingBox.contains(mouseDownCoord);
    }

    updateDimensionsMove(xDistance: number, yDistance: number): void {
        this.boundingBox.rectangle.x += xDistance;
        this.boundingBox.rectangle.y += yDistance;
        this.boundingBox.updateControlPoints();
    }

    saveSelectedPixels(ctx: CanvasRenderingContext2D): void {
        const width = this.boundingBox.rectangle.width;
        const height = this.boundingBox.rectangle.height;
        const xPos = this.boundingBox.rectangle.x;
        const yPos = this.boundingBox.rectangle.y;

        if (width !== 0 && height !== 0) {
            this.imageData = ctx.getImageData(xPos, yPos, width, height);
        }

        const startRow = yPos;
        const limitRow = yPos + height;
        const startCol = xPos;
        const limitCol = xPos + width;
        let pixelCounter = 0;
        const indexRed = 0;
        const indexGreen = 1;
        const indexBlue = 2;
        const indexAlpha = 3;
        const iterationNumber = 4;
        const maxValue = 255;
        for (let i = startRow; i < limitRow; i++) {
            for (let j = startCol; j < limitCol; j++) {
                if (this.imageData.data[pixelCounter + indexAlpha] === 0) {
                    this.imageData.data[pixelCounter + indexRed] = maxValue;
                    this.imageData.data[pixelCounter + indexGreen] = maxValue;
                    this.imageData.data[pixelCounter + indexBlue] = maxValue;
                    this.imageData.data[pixelCounter + indexAlpha] = maxValue;
                }
                pixelCounter += iterationNumber;
            }
        }
    }

    drawImage(ctx: CanvasRenderingContext2D): void {
        const width = this.boundingBox.rectangle.width;
        const height = this.boundingBox.rectangle.height;
        const x = this.boundingBox.rectangle.x;
        const y = this.boundingBox.rectangle.y;

        if (!this.image) {
            const canvas = document.createElement('canvas');
            const tempCtx = canvas.getContext('2d') as CanvasRenderingContext2D;
            canvas.width = this.imageData.width;
            canvas.height = this.imageData.height;
            tempCtx.putImageData(this.imageData, 0, 0);
            this.image = new Image();
            this.image.src = canvas.toDataURL();
            this.image.onload = () => {
                ctx.save();
                ctx.imageSmoothingEnabled = true;
                ctx.globalCompositeOperation = 'destination-over';
                ctx.drawImage(this.image, x, y, width, height);
                ctx.restore();
            };
        } else {
            const PRECISION = 0;
            if (width === PRECISION) this.isImageFlippedHorizontally = !this.isImageFlippedHorizontally;

            if (height === PRECISION) this.isImageFlippedVertically = !this.isImageFlippedVertically;
            if (this.isImageFlippedHorizontally || this.isImageFlippedVertically) this.drawMirrorImage(ctx);
            else {
                ctx.save();
                ctx.imageSmoothingEnabled = true;
                ctx.drawImage(this.image, x, y, width, height);
                ctx.restore();
            }
        }
    }

    drawMirrorImage(ctx: CanvasRenderingContext2D): void {
        const width = this.boundingBox.rectangle.width;
        const height = this.boundingBox.rectangle.height;
        const x = this.boundingBox.rectangle.x;
        const y = this.boundingBox.rectangle.y;

        let newWidth = width;
        let newHeight = height;

        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.translate(x, y);
        // tslint:disable: no-magic-numbers // Reason: user-readable

        if (this.isImageFlippedHorizontally) {
            ctx.scale(-1, 1);
            newWidth = width * -1;
        }
        if (this.isImageFlippedVertically) {
            ctx.scale(1, -1);
            newHeight = height * -1;
        }

        ctx.drawImage(this.image, 0, 0, newWidth, newHeight);
        ctx.restore();
    }

    createActionObject(): ActionObject {
        return new ActionRectangleSelection(
            this.boundingBox.rectangle.x,
            this.boundingBox.rectangle.y,
            this.boundingBox.rectangle.width,
            this.boundingBox.rectangle.height,
        );
    }
}
