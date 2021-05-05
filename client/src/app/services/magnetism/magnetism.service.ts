import { Injectable } from '@angular/core';
import { EllipseSelection } from '@app/classes/selections/ellipse-selection/ellipse-selection';
import { LassoPolygonalSelection } from '@app/classes/selections/lasso-polygonal-selection/lasso-polygonal-selection';
import { RectangleSelection } from '@app/classes/selections/rectangle-selection/rectangle-selection';
import { Vec2 } from '@app/classes/vec2';
import { Handle } from '@app/constants/handle';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class MagnetismService {
    isMagnetismToggled: boolean;
    private snapPosition: Vec2;
    selectedControlPoint: Handle;

    constructor(public drawingService: DrawingService) {
        this.isMagnetismToggled = false;
        this.snapPosition = { x: 0, y: 0 };
        this.selectedControlPoint = Handle.TopLeft;
    }

    snapSelectionToGrid(selection: RectangleSelection | EllipseSelection | LassoPolygonalSelection, directionX: number, directionY: number): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.snapPosition.x += directionX;
        this.snapPosition.y += directionY;
        const gridSquareSize = this.drawingService.gridSquareSize;

        const width = selection.boundingBox.rectangle.width;
        const height = selection.boundingBox.rectangle.height;
        const roundedPositionX = Math.round(this.snapPosition.x / gridSquareSize) * gridSquareSize;
        const roundedPositionY = Math.round(this.snapPosition.y / gridSquareSize) * gridSquareSize;

        switch (this.selectedControlPoint) {
            case Handle.TopLeft:
                selection.boundingBox.rectangle.x = roundedPositionX;
                selection.boundingBox.rectangle.y = roundedPositionY;
                break;
            case Handle.TopRight:
                selection.boundingBox.rectangle.x = roundedPositionX - width;
                selection.boundingBox.rectangle.y = roundedPositionY;
                break;
            case Handle.BottomLeft:
                selection.boundingBox.rectangle.x = roundedPositionX;
                selection.boundingBox.rectangle.y = roundedPositionY - height;
                break;
            case Handle.BottomRight:
                selection.boundingBox.rectangle.x = roundedPositionX - width;
                selection.boundingBox.rectangle.y = roundedPositionY - height;
                break;
            case Handle.Top:
                selection.boundingBox.rectangle.x = roundedPositionX - width / 2;
                selection.boundingBox.rectangle.y = roundedPositionY;
                break;
            case Handle.Left:
                selection.boundingBox.rectangle.x = roundedPositionX;
                selection.boundingBox.rectangle.y = roundedPositionY - height / 2;
                break;
            case Handle.Bottom:
                selection.boundingBox.rectangle.x = roundedPositionX - width / 2;
                selection.boundingBox.rectangle.y = roundedPositionY - height;
                break;
            case Handle.Right:
                selection.boundingBox.rectangle.x = roundedPositionX - width;
                selection.boundingBox.rectangle.y = roundedPositionY - height / 2;
                break;
            case Handle.CenterBox:
                selection.boundingBox.rectangle.x = roundedPositionX - width / 2;
                selection.boundingBox.rectangle.y = roundedPositionY - height / 2;
                break;
        }
        selection.boundingBox.updateControlPoints();
        selection.draw(this.drawingService.previewCtx);
    }

    setSnapPosition(selection: RectangleSelection | EllipseSelection | LassoPolygonalSelection): void {
        const newSnapPosition: Vec2 = { x: 0, y: 0 };
        const x = selection.boundingBox.rectangle.x;
        const y = selection.boundingBox.rectangle.y;
        const width = selection.boundingBox.rectangle.width;
        const height = selection.boundingBox.rectangle.height;
        switch (this.selectedControlPoint) {
            case Handle.TopLeft:
                newSnapPosition.x = x;
                newSnapPosition.y = y;
                break;
            case Handle.TopRight:
                newSnapPosition.x = x + width;
                newSnapPosition.y = y;
                break;
            case Handle.BottomLeft:
                newSnapPosition.x = x;
                newSnapPosition.y = y + height;
                break;
            case Handle.BottomRight:
                newSnapPosition.x = x + width;
                newSnapPosition.y = y + height;
                break;
            case Handle.Top:
                newSnapPosition.x = x + width / 2;
                newSnapPosition.y = y;
                break;
            case Handle.Left:
                newSnapPosition.x = x;
                newSnapPosition.y = y + height / 2;
                break;
            case Handle.Bottom:
                newSnapPosition.x = x + width / 2;
                newSnapPosition.y = y + height;
                break;
            case Handle.Right:
                newSnapPosition.x = x + width;
                newSnapPosition.y = y + height / 2;
                break;
            case Handle.CenterBox:
                newSnapPosition.x = x + width / 2;
                newSnapPosition.y = y + height / 2;
                break;
        }
        this.snapPosition = newSnapPosition;
    }
}
