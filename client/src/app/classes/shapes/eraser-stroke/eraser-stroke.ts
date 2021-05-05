/*import { AbsShape } from '@app/classes/shapes/shape';
import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { Vec2 } from '@app/classes/vec2';

export class EraserStroke extends AbsShape {
    x: number;
    y: number;

    constructor(attributes: ShapeAttribute, primaryColor: string, secondaryColor: string) {
        super(attributes.strokeThickness, attributes.strokeStyle, primaryColor, secondaryColor);
        this.x = 0;
        this.y = 0;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();

        ctx.fillStyle = this.primaryColor;
        ctx.strokeStyle = this.secondaryColor;
        ctx.lineWidth = this.attributes.strokeThickness;

        ctx.fillRect(this.x, this.y, this.attributes.strokeThickness, this.attributes.strokeThickness);

        ctx.restore();
    }

    drawPerimeter(ctx: CanvasRenderingContext2D): void {
        ctx.save();

        ctx.strokeRect(this.x, this.y, this.attributes.strokeThickness, this.attributes.strokeThickness);

        ctx.fillStyle = 'white';
        ctx.fillRect(this.x, this.y, this.attributes.strokeThickness, this.attributes.strokeThickness);

        ctx.restore();
    }

    updateStroke(mousePosition: Vec2): void {
        this.x = mousePosition.x - this.attributes.strokeThickness / 2;
        this.y = mousePosition.y - this.attributes.strokeThickness / 2;
    }

    getPosition(): Vec2 {
        return { x: this.x, y: this.y };
    }
}
*/
import { AbsShape } from '@app/classes/shapes/shape';
import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { Vec2 } from '@app/classes/vec2';
export class EraserStroke extends AbsShape {
    private pathData: Vec2[];
    x: number;
    y: number;

    constructor(attributes: ShapeAttribute, primaryColor: string, secondaryColor: string) {
        super(attributes.strokeThickness, attributes.strokeStyle, primaryColor, secondaryColor);
        this.clearPath();
        this.x = 0;
        this.y = 0;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.beginPath();
        ctx.lineCap = 'square';
        this.pathData.forEach((point, i) => {
            if (i === 0) {
                ctx.moveTo(point.x, point.y);
            }
            ctx.lineTo(point.x, point.y);
        });

        // ctx.fillStyle = this.primaryColor;
        ctx.strokeStyle = 'white';
        ctx.lineWidth = this.attributes.strokeThickness;

        // ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    updateStroke(mousePosition: Vec2): void {
        this.pathData.push(mousePosition);
    }

    updatePositionEraser(mousePosition: Vec2): void {
        this.x = mousePosition.x - this.attributes.strokeThickness / 2;
        this.y = mousePosition.y - this.attributes.strokeThickness / 2;
    }

    clearPath(): void {
        this.pathData = [];
    }

    drawPerimeter(ctx: CanvasRenderingContext2D): void {
        ctx.save();

        ctx.strokeRect(this.x, this.y, this.attributes.strokeThickness, this.attributes.strokeThickness);

        ctx.fillStyle = 'white';
        ctx.fillRect(this.x, this.y, this.attributes.strokeThickness, this.attributes.strokeThickness);

        ctx.restore();
    }
}
