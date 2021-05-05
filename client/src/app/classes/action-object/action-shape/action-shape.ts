import { ActionObject } from '@app/classes/action-object/action-object';
import { AbsShape } from '@app/classes/shapes/shape';
import { DrawingService } from '@app/services/drawing/drawing.service';
export class ActionShape extends ActionObject {
    shape: AbsShape;

    constructor(shape: AbsShape) {
        super();
        this.shape = shape;
    }

    execute(drawingService: DrawingService): void {
        this.shape.draw(drawingService.baseCtx);
    }
}
