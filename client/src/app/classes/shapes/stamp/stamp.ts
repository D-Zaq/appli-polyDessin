import { AbsShape } from '@app/classes/shapes/shape';
import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { Vec2 } from '@app/classes/vec2';
import { DEFAULT_STAMP_SIZE, DEG_TO_RAD_DIV } from '@app/constants/constants';
import { DrawType } from '@app/constants/draw-type';

export class Stamp extends AbsShape {
    mouseDownCoord: Vec2;

    constructor(mouseDownCoord: Vec2, attributes: ShapeAttribute) {
        super(0, DrawType.Fill, 'black', 'black');
        this.attributes.stampImage = attributes.stampImage;
        this.attributes.stampAngle = attributes.stampAngle;
        this.attributes.stampScale = attributes.stampScale;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        if (this.attributes.stampImage) {
            ctx.translate(this.mouseDownCoord.x, this.mouseDownCoord.y);
            ctx.rotate(this.convertDegreesToRad(this.attributes.stampAngle));
            ctx.drawImage(
                this.attributes.stampImage,
                (-this.attributes.stampScale * DEFAULT_STAMP_SIZE) / 2,
                (-this.attributes.stampScale * DEFAULT_STAMP_SIZE) / 2,
                this.attributes.stampScale * DEFAULT_STAMP_SIZE,
                this.attributes.stampScale * DEFAULT_STAMP_SIZE,
            );
        }
        ctx.restore();
    }

    updateDimensions(mousePosition: Vec2, isShiftPressed: boolean): void {
        this.mouseDownCoord = mousePosition;
    }

    convertDegreesToRad(angleInDeg: number): number {
        return (angleInDeg * Math.PI) / DEG_TO_RAD_DIV;
    }
}
