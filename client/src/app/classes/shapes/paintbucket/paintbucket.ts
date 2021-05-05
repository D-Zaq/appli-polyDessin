import { AbsShape } from '@app/classes/shapes/shape';
import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { Vec2 } from '@app/classes/vec2';

export class Paintbucket extends AbsShape {
    width: number;
    height: number;
    x: number;
    y: number;
    tolerance: number;
    color: string;
    similarColorPixels: Vec2[];

    constructor(mouseDownCoord: Vec2, attributes: ShapeAttribute, primaryColor: string, secondaryColor: string) {
        {
            super(attributes.strokeThickness, attributes.strokeStyle, primaryColor, secondaryColor);
            this.x = mouseDownCoord.x;
            this.y = mouseDownCoord.y;
        }
        this.attributes.tolerance = attributes.tolerance;
        this.color = primaryColor;
    }

    sendVec2Array(similarColorPixels: Vec2[]): void {
        this.similarColorPixels = similarColorPixels;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = this.color;
        for (const vec of this.similarColorPixels) {
            const rectangle = new Path2D();
            rectangle.rect(vec.x, vec.y, 1, 1);
            ctx.fill(rectangle);
        }
        ctx.restore();
    }
}
