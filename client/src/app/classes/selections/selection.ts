import { ActionObject } from '@app/classes/action-object/action-object';
import { BoundingBox } from '@app/classes/selections/bounding-box/bounding-box';
import { Vec2 } from '@app/classes/vec2';

export abstract class Selection {
    imageData: ImageData;
    boundingBox: BoundingBox;
    previousLineDash: number[];
    image: HTMLImageElement;
    isImageFlippedHorizontally: boolean;
    isImageFlippedVertically: boolean;

    constructor(boundingBox: BoundingBox) {
        this.boundingBox = boundingBox;
        this.isImageFlippedHorizontally = false;
        this.isImageFlippedVertically = false;
    }

    // tslint:disable-next-line: no-empty
    updateDimensions(mousePosition: Vec2, isShiftPressed?: boolean): void {}

    // tslint:disable-next-line: no-empty
    setLineDash(ctx: CanvasRenderingContext2D): void {}

    // tslint:disable-next-line: no-empty
    resetLineDash(ctx: CanvasRenderingContext2D): void {}

    abstract draw(ctx: CanvasRenderingContext2D): void;

    abstract saveSelectedPixels(ctx: CanvasRenderingContext2D): void;

    contains(mouseDownCoord: Vec2): boolean {
        return true;
    }

    abstract drawImage(ctx: CanvasRenderingContext2D): void;

    // tslint:disable-next-line: no-empty
    closeDrawing(ctx: CanvasRenderingContext2D): void {}

    getPathData(): Vec2[] {
        return [];
    }

    abstract updateDimensionsMove(xDistance: number, yDistance: number): void;

    abstract createActionObject(): ActionObject;

    // tslint:disable-next-line: no-empty // Reason: abstract class
    drawMirrorImage(ctx: CanvasRenderingContext2D): void {}
}
