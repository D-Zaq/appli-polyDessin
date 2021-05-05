import { Selection } from '@app/classes/selections/selection';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { AbsShape } from './shapes/shape';
import { ShapeAttribute } from './shapes/shape-attribute';
import { Vec2 } from './vec2';

// Ceci est justifié vu qu'on a des fonctions qui seront gérés par les classes enfant
// tslint:disable:no-empty
export abstract class Tool {
    mouseDownCoord: Vec2;
    mouseDown: boolean = false;
    usesKeyboard: boolean = false;
    name: string;
    shape: AbsShape;
    selection: Selection;

    constructor(protected drawingService: DrawingService) {}

    onMouseDown(event: MouseEvent): void {}

    onMouseUp(event: MouseEvent): void {}

    onMouseMove(event: MouseEvent): void {}

    onDblClick(event: MouseEvent): void {}

    getPositionFromMouse(event: MouseEvent): Vec2 {
        return { x: event.offsetX, y: event.offsetY };
    }
    onKeyDown(event: KeyboardEvent): void {}
    onKeyUp(event: KeyboardEvent): void {}

    getName(): string {
        return this.name;
    }

    getShape(): AbsShape {
        return this.shape;
    }

    getAttributes(): ShapeAttribute {
        return this.shape.attributes;
    }

    setAttributes(attributes: ShapeAttribute): void {
        this.shape.attributes = attributes;
    }
}
