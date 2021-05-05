import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { Vec2 } from '@app/classes/vec2';
import { DrawType } from '@app/constants/draw-type';
import { ControlPoint } from './control-point';

export abstract class AbsShape {
    attributes: ShapeAttribute;
    primaryColor: string;
    secondaryColor: string;

    constructor(strokeThickness: number, strokeStyle: DrawType, primaryColor: string, secondaryColor: string) {
        this.attributes = new ShapeAttribute(strokeThickness, strokeStyle);
        this.primaryColor = primaryColor;
        this.secondaryColor = secondaryColor;
    }

    // tslint:disable: no-empty // reason: abstract method

    contains(mouseDownCoord: Vec2): boolean {
        throw new Error('Abstract method');
    }

    draw(ctx: CanvasRenderingContext2D): void {}
    fill(ctx: CanvasRenderingContext2D, similarPixels: Vec2[]): void {}

    getAttributes(): ShapeAttribute {
        return this.attributes;
    }

    updateDimensions(currMousePosition: Vec2, isKeyPressed: boolean): void {}

    updateText(newString: string, newX: number, newY: number): void {}
    drawPreview(ctx: CanvasRenderingContext2D): void {}

    drawPerimeter(ctx: CanvasRenderingContext2D): void {}

    updateStroke(currMousePosition: Vec2): void {}

    clearPath(): void {}

    setJunctionPoint(juntionPoint: boolean): void {}

    getPathData(): Vec2[] {
        return [];
    }

    calculateDistance(startCoordinate: Vec2, endCoordinate: Vec2): number {
        return 0;
    }

    closeDrawing(ctx: CanvasRenderingContext2D): void {}

    delete(ctx: CanvasRenderingContext2D): void {}

    getPosition(): Vec2 {
        return { x: 0, y: 0 };
    }

    setLineDash(ctx: CanvasRenderingContext2D): void {}

    resetLineDash(ctx: CanvasRenderingContext2D): void {}

    saveSelectedPixels(ctx: CanvasRenderingContext2D): void {}

    updateDraw(): void {}

    sendVec2Array(array: Vec2[]): void {}

    clearDraw(): void {}

    updatePositionEraser(mousePosition: Vec2): void {}

    getControlPointPressed(mousePosition: Vec2): ControlPoint | undefined {
        return undefined;
    }
}
