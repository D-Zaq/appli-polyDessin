import { ActionLassoSelection } from '@app/classes/action-object/action-lasso-polygonal-selection/action-lasso-polygonal-selection';
import { ActionObject } from '@app/classes/action-object/action-object';
import { BoundingBox } from '@app/classes/selections/bounding-box/bounding-box';
import { Selection } from '@app/classes/selections/selection';
import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { Vec2 } from '@app/classes/vec2';

// i should be able to inherit lineservice in order to have the same behavior before the end of the selection
// only problem is i can't have a multiple inheritance with selection and LineService
export class LassoPolygonalSelection extends Selection {
    imageData: ImageData;
    pathData: Vec2[];
    ctxContains: CanvasRenderingContext2D;
    // tslint:disable-next-line: no-any
    isPointInPolygon: any;
    constructor(mouseDownCoord: Vec2, attributes: ShapeAttribute, primaryColor: string, secondaryColor: string, pathData: Vec2[]) {
        const boundingBox = new BoundingBox(mouseDownCoord, attributes, primaryColor, secondaryColor);
        super(boundingBox);
        this.pathData = pathData;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        if (this.imageData) this.drawImage(ctx);
        this.boundingBox.draw(ctx);
    }

    // SOURCE:https://github.com/mikolalysenko/robust-point-in-polygon
    contains(point: Vec2): boolean {
        // tslint:disable-next-line: no-require-imports
        this.isPointInPolygon = require('robust-point-in-polygon');
        return this.isPointInPolygon(this.pathData, [point.x, point.y]);
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
        let positionPixel: Vec2;
        const indexRed = 0;
        const indexGreen = 1;
        const indexBlue = 2;
        const indexAlpha = 3;
        const iterationNumber = 4;
        const maxValue = 255;

        for (let i = startRow; i < limitRow; i++) {
            for (let j = startCol; j < limitCol; j++) {
                positionPixel = { x: j, y: i };
                if (!this.contains(positionPixel)) {
                    this.imageData.data[pixelCounter + indexRed] = 0;
                    this.imageData.data[pixelCounter + indexGreen] = 0;
                    this.imageData.data[pixelCounter + indexBlue] = 0;
                    this.imageData.data[pixelCounter + indexAlpha] = 0;
                } else if (this.imageData.data[pixelCounter + indexAlpha] === 0) {
                    this.imageData.data[pixelCounter + indexRed] = maxValue;
                    this.imageData.data[pixelCounter + indexGreen] = maxValue;
                    this.imageData.data[pixelCounter + indexBlue] = maxValue;
                    this.imageData.data[pixelCounter + indexAlpha] = maxValue;
                }
                pixelCounter += iterationNumber;
            }
        }
    }

    updateDimensionsMove(xDistance: number, yDistance: number): void {
        this.boundingBox.rectangle.x += xDistance;
        this.boundingBox.rectangle.y += yDistance;
        this.boundingBox.updateControlPoints();
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
                ctx.globalCompositeOperation = 'destination-over';
                ctx.drawImage(this.image, x, y, width, height);
                ctx.restore();
            };
        } else {
            const PRECISION = 1;
            if (width === PRECISION) this.isImageFlippedHorizontally = !this.isImageFlippedHorizontally;
            if (height === PRECISION) this.isImageFlippedVertically = !this.isImageFlippedVertically;
            if (this.isImageFlippedHorizontally || this.isImageFlippedVertically) this.drawMirrorImage(ctx);
            else ctx.drawImage(this.image, x, y, width, height);
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
        const pathDataCopy = this.pathData;
        return new ActionLassoSelection(
            pathDataCopy,
            this.boundingBox.rectangle.x,
            this.boundingBox.rectangle.y,
            this.boundingBox.rectangle.width,
            this.boundingBox.rectangle.height,
        );
    }
}
