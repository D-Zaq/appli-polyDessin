import { Injectable } from '@angular/core';
import { EllipseSelection } from '@app/classes/selections/ellipse-selection/ellipse-selection';
import { LassoPolygonalSelection } from '@app/classes/selections/lasso-polygonal-selection/lasso-polygonal-selection';
import { RectangleSelection } from '@app/classes/selections/rectangle-selection/rectangle-selection';
import { ControlPoint } from '@app/classes/shapes/control-point';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { Handle } from '@app/constants/handle';
import { DrawingService } from '@app/services/drawing/drawing.service';

@Injectable({
    providedIn: 'root',
})
export class ResizeSelectionService extends Tool {
    private currentMousePosition: Vec2;
    isResizing: boolean;
    private controlPoint: ControlPoint;
    private isShiftPressed: boolean;
    private currentCornerPos: Vec2;
    private oppositeCornerPos: Vec2;
    private limitedMousePos: Vec2;
    private ratio: number;

    constructor(drawingService: DrawingService) {
        super(drawingService);
        this.isResizing = false;
        this.isShiftPressed = false;
        this.currentMousePosition = { x: 0, y: 0 };
    }

    onInit(selection: RectangleSelection | EllipseSelection | LassoPolygonalSelection, controlPoint: ControlPoint): void {
        this.selection = selection;
        this.currentMousePosition = { x: 0, y: 0 };
        this.limitedMousePos = { x: 0, y: 0 };
        this.currentCornerPos = { x: 0, y: 0 };
        this.oppositeCornerPos = { x: 0, y: 0 };
        this.isResizing = true;
        this.controlPoint = controlPoint;
        this.isShiftPressed = false;
        this.ratio = 1;
    }

    onKeyDown(event: KeyboardEvent): void {
        this.isShiftPressed = true;
    }

    onKeyUp(event: KeyboardEvent): void {
        this.isShiftPressed = false;
    }

    onMouseDown(event: MouseEvent): void {
        this.currentMousePosition = this.getPositionFromMouse(event);
        this.isResizing = true;
    }

    onMouseUp(event: MouseEvent): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.selection.resetLineDash(this.drawingService.previewCtx);
        this.selection.draw(this.drawingService.previewCtx);
    }

    // tslint:disable-next-line: cyclomatic-complexity // reason: Keep all cases unfragmented
    onMouseMove(event: MouseEvent): void {
        this.currentMousePosition = this.getPositionFromMouse(event);
        switch (this.controlPoint.handle) {
            case Handle.TopLeft:
                if (this.isShiftPressed) this.keepAspectRatioTopLeft();
                else {
                    this.selection.boundingBox.rectangle.width += this.selection.boundingBox.rectangle.x - this.currentMousePosition.x;
                    this.selection.boundingBox.rectangle.height += this.selection.boundingBox.rectangle.y - this.currentMousePosition.y;
                    this.selection.boundingBox.rectangle.x = this.currentMousePosition.x;
                    this.selection.boundingBox.rectangle.y = this.currentMousePosition.y;
                }
                break;
            case Handle.TopRight:
                if (this.isShiftPressed) this.keepAspectRatioTopRight();
                else {
                    this.selection.boundingBox.rectangle.width = this.currentMousePosition.x - this.selection.boundingBox.rectangle.x;
                    this.selection.boundingBox.rectangle.height += this.selection.boundingBox.rectangle.y - this.currentMousePosition.y;
                    this.selection.boundingBox.rectangle.y = this.currentMousePosition.y;
                }
                break;
            case Handle.BottomLeft:
                if (this.isShiftPressed) this.keepAspectRatioBottomLeft();
                else {
                    this.selection.boundingBox.rectangle.width += this.selection.boundingBox.rectangle.x - this.currentMousePosition.x;
                    this.selection.boundingBox.rectangle.x = this.currentMousePosition.x;
                    this.selection.boundingBox.rectangle.height = this.currentMousePosition.y - this.selection.boundingBox.rectangle.y;
                }
                break;
            case Handle.BottomRight:
                if (this.isShiftPressed) this.keepAspectRatioBottomRight();
                else {
                    this.selection.boundingBox.rectangle.width = this.currentMousePosition.x - this.selection.boundingBox.rectangle.x;
                    this.selection.boundingBox.rectangle.height = this.currentMousePosition.y - this.selection.boundingBox.rectangle.y;
                }
                break;
            case Handle.Top:
                if (this.selection.isImageFlippedVertically)
                    this.selection.boundingBox.rectangle.height = this.currentMousePosition.y - this.selection.boundingBox.rectangle.y;
                else {
                    this.selection.boundingBox.rectangle.height += this.selection.boundingBox.rectangle.y - this.currentMousePosition.y;
                    this.selection.boundingBox.rectangle.y = this.currentMousePosition.y;
                }
                break;
            case Handle.Left:
                if (this.selection.isImageFlippedHorizontally)
                    this.selection.boundingBox.rectangle.width = this.currentMousePosition.x - this.selection.boundingBox.rectangle.x;
                else {
                    this.selection.boundingBox.rectangle.width += this.selection.boundingBox.rectangle.x - this.currentMousePosition.x;
                    this.selection.boundingBox.rectangle.x = this.currentMousePosition.x;
                }
                break;
            case Handle.Bottom:
                if (this.selection.isImageFlippedVertically) {
                    this.selection.boundingBox.rectangle.height += this.selection.boundingBox.rectangle.y - this.currentMousePosition.y;
                    this.selection.boundingBox.rectangle.y = this.currentMousePosition.y;
                } else this.selection.boundingBox.rectangle.height = this.currentMousePosition.y - this.selection.boundingBox.rectangle.y;

                break;
            case Handle.Right:
                if (this.selection.isImageFlippedHorizontally) {
                    this.selection.boundingBox.rectangle.width += this.selection.boundingBox.rectangle.x - this.currentMousePosition.x;
                    this.selection.boundingBox.rectangle.x = this.currentMousePosition.x;
                } else this.selection.boundingBox.rectangle.width = this.currentMousePosition.x - this.selection.boundingBox.rectangle.x;
                break;
        }
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.selection.boundingBox.updateControlPoints();
        this.selection.setLineDash(this.drawingService.previewCtx);
        this.selection.draw(this.drawingService.previewCtx);
    }
    updateCornersCoords(x: string, y: string): void {
        if (x === 'left') {
            this.currentCornerPos.x = this.selection.boundingBox.rectangle.x;
            this.oppositeCornerPos.x = this.selection.boundingBox.rectangle.x + this.selection.boundingBox.rectangle.width;
        }
        if (x === 'right') {
            this.oppositeCornerPos.x = this.selection.boundingBox.rectangle.x;
            this.currentCornerPos.x = this.selection.boundingBox.rectangle.x + this.selection.boundingBox.rectangle.width;
        }
        if (y === 'top') {
            this.currentCornerPos.y = this.selection.boundingBox.rectangle.y;
            this.oppositeCornerPos.y = this.selection.boundingBox.rectangle.y + this.selection.boundingBox.rectangle.height;
        }
        if (y === 'bottom') {
            this.oppositeCornerPos.y = this.selection.boundingBox.rectangle.y;
            this.currentCornerPos.y = this.selection.boundingBox.rectangle.y + this.selection.boundingBox.rectangle.height;
        }
    }
    updateLimitedMousePos(posToCheck: Vec2, x: string, y: string): void {
        if (x === 'left') {
            if (posToCheck.x > this.oppositeCornerPos.x - 1) {
                this.limitedMousePos.x = this.oppositeCornerPos.x - 1;
            } else {
                this.limitedMousePos.x = posToCheck.x;
            }
        }
        if (x === 'right') {
            if (posToCheck.x < this.oppositeCornerPos.x + 1) {
                this.limitedMousePos.x = this.oppositeCornerPos.x + 1;
            } else {
                this.limitedMousePos.x = posToCheck.x;
            }
        }
        if (y === 'top') {
            if (posToCheck.y > this.oppositeCornerPos.y - 1) {
                this.limitedMousePos.y = this.oppositeCornerPos.y - 1;
            } else {
                this.limitedMousePos.y = posToCheck.y;
            }
        }
        if (y === 'bottom') {
            if (posToCheck.y < this.oppositeCornerPos.y + 1) {
                this.limitedMousePos.y = this.oppositeCornerPos.y + 1;
            } else {
                this.limitedMousePos.y = posToCheck.y;
            }
        }
    }
    updateRatio(): void {
        let pointsA: Vec2 = { x: this.currentCornerPos.x, y: this.currentCornerPos.y };
        let pointsB = { x: this.oppositeCornerPos.x, y: this.oppositeCornerPos.y };
        const distanceToCurrentCorner = this.getDistance(pointsA, pointsB);

        pointsA = { x: this.limitedMousePos.x, y: this.limitedMousePos.y };
        pointsB = { x: this.oppositeCornerPos.x, y: this.oppositeCornerPos.y };

        const distanceToMouse = this.getDistance(pointsA, pointsB);
        this.ratio = distanceToMouse / distanceToCurrentCorner;
    }

    updateAttribs(x: string, y: string): void {
        this.updateCornersCoords(x, y);
        this.updateLimitedMousePos(this.currentMousePosition, x, y);
        this.updateRatio();
    }

    keepAspectRatioBottomRight(): void {
        this.updateAttribs('right', 'bottom');
        this.selection.boundingBox.rectangle.width *= this.ratio;
        this.selection.boundingBox.rectangle.height *= this.ratio;
    }

    keepAspectRatioTopRight(): void {
        this.updateAttribs('right', 'top');
        const oldCorner: Vec2 = { x: this.currentCornerPos.x, y: this.currentCornerPos.y };
        this.selection.boundingBox.rectangle.y = this.oppositeCornerPos.y - this.selection.boundingBox.rectangle.height * this.ratio;
        this.selection.boundingBox.rectangle.width *= this.ratio;
        this.selection.boundingBox.rectangle.height += oldCorner.y - this.selection.boundingBox.rectangle.y;
    }

    keepAspectRatioTopLeft(): void {
        this.updateAttribs('left', 'top');
        const oldCorner: Vec2 = { x: this.currentCornerPos.x, y: this.currentCornerPos.y };
        this.selection.boundingBox.rectangle.x = this.oppositeCornerPos.x - this.selection.boundingBox.rectangle.width * this.ratio;
        this.selection.boundingBox.rectangle.y = this.oppositeCornerPos.y - this.selection.boundingBox.rectangle.height * this.ratio;
        this.selection.boundingBox.rectangle.width += oldCorner.x - this.selection.boundingBox.rectangle.x;
        this.selection.boundingBox.rectangle.height += oldCorner.y - this.selection.boundingBox.rectangle.y;
    }

    keepAspectRatioBottomLeft(): void {
        this.updateAttribs('left', 'bottom');
        const oldCorner: Vec2 = { x: this.currentCornerPos.x, y: this.currentCornerPos.y };
        this.selection.boundingBox.rectangle.x = this.oppositeCornerPos.x - this.selection.boundingBox.rectangle.width * this.ratio;
        this.selection.boundingBox.rectangle.width += oldCorner.x - this.selection.boundingBox.rectangle.x;
        this.selection.boundingBox.rectangle.height *= this.ratio;
    }

    getDistance(pointsA: Vec2, pointsB: Vec2): number {
        return Math.sqrt(Math.pow(pointsB.y - pointsA.y, 2) + Math.pow(pointsB.x - pointsA.x, 2));
    }
}
