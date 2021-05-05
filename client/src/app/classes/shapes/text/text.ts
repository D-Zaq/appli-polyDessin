import { AbsShape } from '@app/classes/shapes/shape';
import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { Vec2 } from '@app/classes/vec2';

export class Text extends AbsShape {
    text: string[];
    textX: number;
    textY: number;
    constructor(
        mouseDownCoord: Vec2,
        attributes: ShapeAttribute,
        primaryColor: string,
        secondaryColor: string,
        textSize: number,
        isBold: boolean,
        isItalic: boolean,
        textFont: string,
        textAlignment: string,
        text: string[],
    ) {
        super(attributes.strokeThickness, attributes.strokeStyle, primaryColor, secondaryColor);
        this.textY = mouseDownCoord.y;
        this.textX = mouseDownCoord.x;
        this.text = text;
        this.attributes.textAttributes.textSize = textSize;
        this.attributes.textAttributes.textBold = isBold;
        this.attributes.textAttributes.textItalic = isItalic;
        this.attributes.textAttributes.textFont = textFont;
        this.attributes.textAttributes.textAlign = textAlignment;
    }

    draw(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.beginPath();
        this.applyToCanvas(ctx);
        ctx.restore();
    }
    drawPreview(ctx: CanvasRenderingContext2D): void {
        this.applyToCanvas(ctx);
    }

    applyToCanvas(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.primaryColor;
        let combinedFont = '';
        if (this.attributes.textAttributes.textBold) combinedFont += 'bold ';
        if (this.attributes.textAttributes.textItalic) combinedFont += 'italic ';
        combinedFont += String(String(this.attributes.textAttributes.textSize) + 'px ');
        combinedFont += this.attributes.textAttributes.textFont;
        ctx.font = combinedFont;
        ctx.textAlign = this.attributes.textAttributes.textAlign as CanvasTextAlign;
        let counter = 0;
        for (const line of this.text) {
            ctx.fillText(line, this.textX, this.textY + counter * this.attributes.textAttributes.textSize);
            counter++;
        }
    }
}
