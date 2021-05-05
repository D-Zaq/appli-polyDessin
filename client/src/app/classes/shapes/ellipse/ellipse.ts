import { AbsShape } from '@app/classes/shapes/shape';
import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { Vec2 } from '@app/classes/vec2';
import { DrawType } from '@app/constants/draw-type';

export class Ellipse extends AbsShape {
    mouseDownCoord: Vec2;
    x: number;
    y: number;
    radiusX: number;
    radiusY: number;

    constructor(mouseDownCoord: Vec2, attributes: ShapeAttribute, primaryColor: string, secondaryColor: string) {
        super(attributes.strokeThickness, attributes.strokeStyle, primaryColor, secondaryColor);
        this.radiusX = 0;
        this.radiusY = 0;
        this.mouseDownCoord = mouseDownCoord;
        this.x = this.mouseDownCoord.x;
        this.y = this.mouseDownCoord.y;
    }

    contains(mouseDownCoord: Vec2): boolean {
        return (
            Math.pow(mouseDownCoord.x - this.x, 2) / Math.pow(this.radiusX, 2) + Math.pow(mouseDownCoord.y - this.y, 2) / Math.pow(this.radiusY, 2) <=
            1
        );
    }
    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.radiusX, this.radiusY, 0, 0, 2 * Math.PI);

        ctx.lineWidth = this.attributes.strokeThickness;

        switch (this.attributes.strokeStyle) {
            case DrawType.Fill:
                ctx.fillStyle = this.primaryColor;
                ctx.fill();
                break;
            case DrawType.Outline:
                ctx.strokeStyle = this.secondaryColor;
                ctx.stroke();
                break;
            case DrawType.OutlineFill:
                ctx.fillStyle = this.primaryColor;
                ctx.strokeStyle = this.secondaryColor;
                ctx.fill();
                ctx.stroke();
                break;
        }

        ctx.restore();
    }

    updateDimensions(mousePosition: Vec2, isShiftPressed: boolean): void {
        this.x = this.mouseDownCoord.x + Math.abs((this.mouseDownCoord.x - mousePosition.x) / 2);
        this.y = this.mouseDownCoord.y + Math.abs((this.mouseDownCoord.y - mousePosition.y) / 2);

        this.radiusX = Math.abs(mousePosition.x - this.x);
        this.radiusY = Math.abs(mousePosition.y - this.y);
        if (isShiftPressed) {
            this.radiusX = this.radiusY > this.radiusX ? this.radiusY : this.radiusX;
            this.radiusY = this.radiusX > this.radiusY ? this.radiusX : this.radiusY;
        }
    }

    drawPerimeter(ctx: CanvasRenderingContext2D): void {
        ctx.save();

        const firstDash = 10;
        const lastDash = 20;

        ctx.setLineDash([firstDash, lastDash]);
        ctx.strokeRect(this.x - this.radiusX, this.y - this.radiusY, this.radiusX * 2, this.radiusY * 2);

        ctx.restore();
    }

    clone(): Ellipse {
        const ellipseClone = new Ellipse({ x: this.x, y: this.y }, this.attributes, this.primaryColor, this.secondaryColor);
        ellipseClone.radiusX = this.radiusX;
        ellipseClone.radiusY = this.radiusY;
        return ellipseClone;
    }
}
