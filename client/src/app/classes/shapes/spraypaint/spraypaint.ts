import { AbsShape } from '@app/classes/shapes/shape';
import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { Vec2 } from '@app/classes/vec2';

export class Spraypaint extends AbsShape {
    affectedPixels: Vec2[];
    mouseX: number;
    mouseY: number;
    DEFAULT_PERCENTOFDIAMETER: number = 0.05;
    MAX_ANGLE: number = 360;
    constructor(
        mouseDownCoord: Vec2,
        attributes: ShapeAttribute,
        primaryColor: string,
        secondaryColor: string,
        dropletSize: number,
        diameterSize: number,
        strokeInterval: number,
    ) {
        super(attributes.strokeThickness, attributes.strokeStyle, primaryColor, secondaryColor);
        this.mouseX = mouseDownCoord.x;
        this.mouseY = mouseDownCoord.y;
        this.attributes.strokeDiameter = diameterSize;
        this.attributes.dropletSize = dropletSize;
        this.attributes.strokeInterval = strokeInterval;
        this.clearDraw();
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = this.primaryColor;

        this.affectedPixels.forEach((point) => {
            const circle = new Path2D();
            ctx.fillStyle = this.primaryColor;
            circle.arc(point.x, point.y, this.attributes.dropletSize, 0, this.MAX_ANGLE, false);
            ctx.fill(circle);
            // const rectangle = new Path2D();
            // ctx.fillStyle = this.primaryColor;
            // rectangle.rect(point.x, point.y, this.attributes.dropletSize / 2, this.attributes.dropletSize / 2);
            // ctx.fill(rectangle);
        });
        ctx.restore();
    }

    updateDraw(): void {
        let nbrOfDropletsSprayed: number;
        nbrOfDropletsSprayed = Math.round(this.attributes.strokeDiameter * this.DEFAULT_PERCENTOFDIAMETER);
        for (let i = 0; i < nbrOfDropletsSprayed; i++) {
            const randomAngle = Math.random() * Math.PI * 2;
            const randomRadius = Math.sqrt(Math.random()) * this.attributes.strokeDiameter;
            const newX = randomRadius * Math.cos(randomAngle) + this.mouseX;
            const newY = randomRadius * Math.sin(randomAngle) + this.mouseY;
            const newPixel: Vec2 = { x: newX, y: newY };
            this.affectedPixels.push(newPixel);
        }
    }

    updateStroke(currMousePosition: Vec2): void {
        this.mouseX = currMousePosition.x;
        this.mouseY = currMousePosition.y;
    }

    clearDraw(): void {
        this.affectedPixels = [];
    }
}
