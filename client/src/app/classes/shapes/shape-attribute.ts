import {
    DEFAULT_NB_SIDES,
    DEFAULT_STAMP_ANGLE,
    DEFAULT_STAMP_SCALE,
    DEFAULT_TEXTALIGN,
    DEFAULT_TEXTBOLD,
    DEFAULT_TEXTFONT,
    DEFAULT_TEXTITALIC,
    DEFAULT_TEXTSIZE,
    DEFAULT_TOLERANCE,
} from '@app/constants/constants';
import { DrawType } from '@app/constants/draw-type';
import { TextAttributes } from './text/text-attributes';

export class ShapeAttribute {
    strokeThickness: number;
    strokeStyle: DrawType;
    strokeInterval: number;
    strokeDiameter: number;
    dropletSize: number;
    nbSides: number;
    tolerance: number;
    textAttributes: TextAttributes;
    stampImage: HTMLImageElement;
    stampScale: number;
    stampAngle: number;

    constructor(strokeThickness: number, strokeStyle: DrawType) {
        this.strokeThickness = strokeThickness;
        this.strokeStyle = strokeStyle;
        this.nbSides = DEFAULT_NB_SIDES;
        this.tolerance = DEFAULT_TOLERANCE;

        this.textAttributes = {
            textFont: DEFAULT_TEXTFONT,
            textSize: DEFAULT_TEXTSIZE,
            textBold: DEFAULT_TEXTBOLD,
            textItalic: DEFAULT_TEXTITALIC,
            textAlign: DEFAULT_TEXTALIGN,
        };

        this.stampScale = DEFAULT_STAMP_SCALE;
        this.stampAngle = DEFAULT_STAMP_ANGLE;
    }
}
