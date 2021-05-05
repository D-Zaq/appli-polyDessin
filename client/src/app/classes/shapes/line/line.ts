import { AbsShape } from '@app/classes/shapes/shape';
import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { Vec2 } from '@app/classes/vec2';
export class Line extends AbsShape {
    x: number;
    y: number;
    pathData: Vec2[];
    modifiedPath: Vec2[];
    radius: number;
    junctionPoint: boolean;

    constructor(junctionPoint: boolean, attributes: ShapeAttribute, primaryColor: string, secondaryColor: string) {
        super(attributes.strokeThickness, attributes.strokeStyle, primaryColor, secondaryColor);
        this.pathData = [];
        this.modifiedPath = [];
        this.junctionPoint = junctionPoint;
        this.clearPath();
    }

    // Draw a line for every point of the path
    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();

        const radiusValue = this.attributes.strokeThickness;

        ctx.lineWidth = this.attributes.strokeThickness;
        ctx.fillStyle = this.primaryColor;
        ctx.strokeStyle = this.secondaryColor;

        // add a condition to handle the boolean
        if (this.junctionPoint) {
            const i = 2;
            const j = 3;
            this.radius = radiusValue; // Arc radius
            const startAngle = 0; // Starting point on circle
            const endAngle = Math.PI + (Math.PI * j) / 2; // End point on circle
            const anticlockwise = i % 2 !== 0; // clockwise or anticlockwise

            for (const point of this.pathData) {
                ctx.beginPath();
                ctx.arc(point.x, point.y, this.radius, startAngle, endAngle, anticlockwise);
            }
            ctx.lineWidth = 1;
        }

        ctx.beginPath();
        for (const point of this.pathData) {
            ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
        ctx.restore();
    }

    // this method will delete the last segment created
    delete(ctx: CanvasRenderingContext2D): void {
        this.pathData.pop(); // this will remove the last item from the end of the path array
        // we clear the canvas here
        // ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        this.draw(ctx);
    }

    // this method will clear the array pathData
    clearPath(): void {
        this.pathData = [];
    }

    // this method will close the path, when called
    closeDrawing(ctx: CanvasRenderingContext2D): void {
        ctx.closePath();
        ctx.stroke();
    }

    // Determine the distance between two points
    calculateDistance(startCoordinate: Vec2, endCoordinate: Vec2): number {
        const distanceX = Math.abs(endCoordinate.x - startCoordinate.x);
        const distanceY = Math.abs(endCoordinate.y - startCoordinate.y);

        const totalDistance = Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2));

        return totalDistance;
    }

    setJunctionPoint(junctionPoint: boolean): void {
        this.junctionPoint = junctionPoint;
    }

    getPathData(): Vec2[] {
        return this.pathData;
    }
}
