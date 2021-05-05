import { AbsShape } from '@app/classes/shapes/shape';
import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { Vec2 } from '@app/classes/vec2';
import { DrawType } from '@app/constants/draw-type';
export class Rectangle extends AbsShape {
    mouseDownCoord: Vec2;
    width: number;
    height: number;
    x: number;
    y: number;

    constructor(mouseDownCoord: Vec2, attributes: ShapeAttribute, primaryColor: string, secondaryColor: string) {
        super(attributes.strokeThickness, attributes.strokeStyle, primaryColor, secondaryColor);
        this.width = 0;
        this.height = 0;
        this.mouseDownCoord = mouseDownCoord;
        this.x = mouseDownCoord.x;
        this.y = mouseDownCoord.y;
    }

    contains(mousePosition: Vec2): boolean {
        return (
            this.x <= mousePosition.x &&
            mousePosition.x <= this.x + this.width &&
            this.y <= mousePosition.y &&
            mousePosition.y <= this.y + this.height
        );
    }

    updateDimensions(mousePosition: Vec2, isShiftPressed?: boolean): void {
        this.x = Math.min(this.mouseDownCoord.x, mousePosition.x);
        this.y = Math.min(this.mouseDownCoord.y, mousePosition.y);
        this.width = Math.abs(this.mouseDownCoord.x - mousePosition.x);
        this.height = Math.abs(this.mouseDownCoord.y - mousePosition.y);

        if (isShiftPressed) {
            const newWidth = this.width;
            const newHeight = this.height;

            this.width = this.height > this.width ? this.height : this.width;
            this.height = this.width > this.height ? this.width : this.height;

            this.x = mousePosition.x < this.mouseDownCoord.x ? this.x + newWidth - this.width : this.x;
            this.y = mousePosition.y < this.mouseDownCoord.y ? this.y + newHeight - this.height : this.y;
        }
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();

        ctx.beginPath();
        ctx.rect(this.x, this.y, this.width, this.height);

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
}
