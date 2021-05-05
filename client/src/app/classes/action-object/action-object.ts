import { ImageMoveSelection } from '@app/classes/image-move-selection';
import { DrawingService } from '@app/services/drawing/drawing.service';

export abstract class ActionObject {
    abstract execute(drawingService: DrawingService): void;

    // tslint:disable-next-line: no-empty Reason: non abstract method
    setImageMoveSelect(imageMoveSelect: ImageMoveSelection): void {}

    getImageMoveSelect(): ImageMoveSelection | undefined {
        return undefined;
    }
}
