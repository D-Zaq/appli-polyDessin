import { AbsShape } from '@app/classes/shapes/shape';
import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { Vec2 } from '@app/classes/vec2';
export class PencilStroke extends AbsShape {
    private pathData: Vec2[];

    constructor(attributes: ShapeAttribute, primaryColor: string, secondaryColor: string) {
        super(attributes.strokeThickness, attributes.strokeStyle, primaryColor, secondaryColor);
        this.clearPath();
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.beginPath();
        ctx.lineCap = 'round';
        this.pathData.forEach((point, i) => {
            if (i === 0) {
                ctx.moveTo(point.x, point.y);
            }
            ctx.lineTo(point.x, point.y);
        });

        ctx.strokeStyle = this.primaryColor;
        ctx.lineWidth = this.attributes.strokeThickness;

        ctx.stroke();
        ctx.restore();
    }

    updateStroke(mousePosition: Vec2): void {
        this.pathData.push(mousePosition);
    }

    clearPath(): void {
        this.pathData = [];
    }
}
