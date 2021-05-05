import { AbsShape } from '@app/classes/shapes/shape';
import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { Vec2 } from '@app/classes/vec2';
import { DrawType } from '@app/constants/draw-type';

export class Polygon extends AbsShape {
    nbSides: number;
    mouseDownCoord: Vec2;
    centerCoord: Vec2;
    size: number;

    circleRadius: number;

    constructor(mouseDownCoord: Vec2, attributes: ShapeAttribute, primaryColor: string, secondaryColor: string) {
        super(attributes.strokeThickness, attributes.strokeStyle, primaryColor, secondaryColor);
        this.mouseDownCoord = mouseDownCoord;
        this.centerCoord = { x: 0, y: 0 };
        this.nbSides = attributes.nbSides;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();

        ctx.beginPath();
        ctx.moveTo(this.centerCoord.x + this.size * Math.cos(0), this.centerCoord.y + this.size * Math.sin(0));

        for (let i = 1; i <= this.nbSides; i += 1) {
            ctx.lineTo(
                this.centerCoord.x + this.size * Math.cos((i * 2 * Math.PI) / this.nbSides),
                this.centerCoord.y + this.size * Math.sin((i * 2 * Math.PI) / this.nbSides),
            );
        }

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
        this.centerCoord.x = this.mouseDownCoord.x + Math.abs((this.mouseDownCoord.x - mousePosition.x) / 2);
        this.centerCoord.y = this.mouseDownCoord.y + Math.abs((this.mouseDownCoord.y - mousePosition.y) / 2);
        this.circleRadius = Math.max(Math.abs(this.centerCoord.x - mousePosition.x), Math.abs(this.centerCoord.y - mousePosition.y)) / 2;
        this.size = Math.abs(2 * this.circleRadius);
    }

    drawPerimeter(ctx: CanvasRenderingContext2D): void {
        ctx.save();

        const firstDash = 10;
        const lastDash = 20;

        ctx.setLineDash([firstDash, lastDash]);
        ctx.ellipse(this.centerCoord.x, this.centerCoord.y, this.circleRadius * 2, this.circleRadius * 2, 0, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.restore();
    }
}
