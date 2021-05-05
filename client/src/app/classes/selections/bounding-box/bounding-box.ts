import { ControlPoint } from '@app/classes/shapes/control-point';
import { Rectangle } from '@app/classes/shapes/rectangle/rectangle';
import { AbsShape } from '@app/classes/shapes/shape';
import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { Vec2 } from '@app/classes/vec2';
import { Handle } from '@app/constants/handle';

export class BoundingBox extends AbsShape {
    rectangle: Rectangle;
    controlPoints: ControlPoint[];

    constructor(mouseDownCoord: Vec2, attributes: ShapeAttribute, primaryColor: string, secondaryColor: string) {
        super(attributes.strokeThickness, attributes.strokeStyle, primaryColor, secondaryColor);
        this.rectangle = new Rectangle(mouseDownCoord, attributes, primaryColor, secondaryColor);
    }

    createControlPoints(): void {
        this.controlPoints = [];
        const SIZE_LIMIT = 8;
        for (let i = 0; i < SIZE_LIMIT; i++) {
            const controlPoint = { x: 0, y: 0, sideLength: 9, handle: Object.values(Handle)[i] };
            this.controlPoints.push(controlPoint);
        }
    }

    getControlPointPressed(mousePosition: Vec2): ControlPoint | undefined {
        for (const controlPoint of this.controlPoints) {
            if (
                controlPoint.x <= mousePosition.x &&
                mousePosition.x <= controlPoint.x + controlPoint.sideLength &&
                controlPoint.y <= mousePosition.y &&
                mousePosition.y <= controlPoint.y + controlPoint.sideLength
            )
                return controlPoint;
        }
        return undefined;
    }

    updateDimensions(mousePosition: Vec2, isShiftPressed?: boolean): void {
        this.rectangle.updateDimensions(mousePosition, isShiftPressed);
        this.updateControlPoints();
    }

    contains(mousePosition: Vec2): boolean {
        return this.rectangle.contains(mousePosition);
    }

    updateControlPoints(): void {
        if (!this.controlPoints) {
            this.createControlPoints();
        }

        // tslint:disable: no-magic-numbers // reason: index of the array
        const PRECISION = 2.5;

        // Top left
        this.controlPoints[0].x = this.rectangle.x - (3 * PRECISION) / 2;
        this.controlPoints[0].y = this.rectangle.y - PRECISION;

        // Top
        this.controlPoints[1].x = this.rectangle.x + this.rectangle.width / 2 - PRECISION;
        this.controlPoints[1].y = this.rectangle.y - (3 * PRECISION) / 2;
        // Top right
        this.controlPoints[2].x = this.rectangle.x + this.rectangle.width - (3 * PRECISION) / 2;
        this.controlPoints[2].y = this.rectangle.y - PRECISION;
        // Left
        this.controlPoints[3].x = this.rectangle.x - (3 * PRECISION) / 2;
        this.controlPoints[3].y = this.rectangle.y + this.rectangle.height / 2 - (3 * PRECISION) / 2;
        // Right
        this.controlPoints[4].x = this.rectangle.x + this.rectangle.width - (3 * PRECISION) / 2;
        this.controlPoints[4].y = this.rectangle.y + this.rectangle.height / 2 - PRECISION;
        // Bottom Left
        this.controlPoints[5].x = this.rectangle.x - (3 * PRECISION) / 2;
        this.controlPoints[5].y = this.rectangle.y + this.rectangle.height - PRECISION;
        // Bottom
        this.controlPoints[6].x = this.rectangle.x + this.rectangle.width / 2 - PRECISION;
        this.controlPoints[6].y = this.rectangle.y + this.rectangle.height - (3 * PRECISION) / 2;
        // Bottom right
        this.controlPoints[7].x = this.rectangle.x + this.rectangle.width - (3 * PRECISION) / 2;
        this.controlPoints[7].y = this.rectangle.y + this.rectangle.height - (3 * PRECISION) / 2;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.beginPath();
        // Draw bounding box
        ctx.rect(this.rectangle.x, this.rectangle.y, this.rectangle.width, this.rectangle.height);
        ctx.stroke();
        ctx.closePath();

        // Draw control points
        ctx.beginPath();
        ctx.fillStyle = '#199adf';
        if (this.controlPoints) {
            this.controlPoints.forEach((controlPoint) => {
                ctx.rect(controlPoint.x, controlPoint.y, controlPoint.sideLength, controlPoint.sideLength);
            });
        }

        ctx.fill();

        ctx.closePath();
        ctx.restore();
    }
}
