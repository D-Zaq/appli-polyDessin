import { Injectable } from '@angular/core';
import { EllipseSelection } from '@app/classes/selections/ellipse-selection/ellipse-selection';
import { LassoPolygonalSelection } from '@app/classes/selections/lasso-polygonal-selection/lasso-polygonal-selection';
import { RectangleSelection } from '@app/classes/selections/rectangle-selection/rectangle-selection';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { DISTANCE, DISTANCE_MAGNETISM } from '@app/constants/constants';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MagnetismService } from '@app/services/magnetism/magnetism.service';

@Injectable({
    providedIn: 'root',
})
export class MoveSelectionService extends Tool {
    private previousMousePosition: Vec2;
    private currentMousePosition: Vec2;
    private keys: Map<string, boolean>;
    handleTimeout: ReturnType<typeof setTimeout>;
    handleInterval: ReturnType<typeof setInterval>;
    private keyUpTime: Date;
    private keyDownTime: Date;
    private isHandlersStarted: boolean;
    isDragging: boolean;

    constructor(drawingService: DrawingService, private magnetismService: MagnetismService) {
        super(drawingService);
        this.currentMousePosition = { x: 0, y: 0 };
        this.previousMousePosition = this.currentMousePosition;
        this.isDragging = false;
    }

    onInit(selection: RectangleSelection | EllipseSelection | LassoPolygonalSelection): void {
        this.selection = selection;
        if (this.magnetismService.isMagnetismToggled) this.magnetismService.setSnapPosition(this.selection);
        this.currentMousePosition = { x: 0, y: 0 };
        this.previousMousePosition = this.currentMousePosition;
        this.keys = new Map<string, boolean>();
        this.keyDownTime = new Date();
        this.isHandlersStarted = false;
        this.isDragging = true;
    }

    onKeyDown(event: KeyboardEvent): void {
        event.preventDefault();
        switch (event.key) {
            case 'ArrowLeft':
                this.keys.set('ArrowLeft', true);
                break;
            case 'ArrowRight':
                this.keys.set('ArrowRight', true);
                break;
            case 'ArrowUp':
                this.keys.set('ArrowUp', true);
                break;
            case 'ArrowDown':
                this.keys.set('ArrowDown', true);
                break;
        }

        if (!this.isHandlersStarted) {
            this.isHandlersStarted = true;
            this.keyDownTime = new Date();
            const waitTimeMsIsPressed = 500;

            this.handleTimeout = setTimeout(() => {
                if (this.keyDownTime > this.keyUpTime || !this.keyUpTime) {
                    const waitTimeMs = 100;
                    this.handleInterval = setInterval(() => {
                        this.moveSelectionWithArrows();
                    }, waitTimeMs);
                }
            }, waitTimeMsIsPressed);
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        this.keyUpTime = new Date();
        const waitTimeMsIsPressed = 500;
        if (this.keyDownTime.getTime() - this.keyUpTime.getTime() < waitTimeMsIsPressed) {
            this.moveSelectionWithArrows();
        }

        let isAnyKeyPressed = false;

        this.keys.forEach((value: boolean, key: string) => {
            if (key === event.key) this.keys.set(key, false);
            if (this.keys.get(key) === true) isAnyKeyPressed = true;
        });

        if (!isAnyKeyPressed) {
            this.isHandlersStarted = false;
            window.clearInterval(this.handleTimeout);
            window.clearInterval(this.handleInterval);
        }
    }
    moveSelectionWithArrows(): void {
        const direction: Vec2 = { x: 0, y: 0 };
        const distance = this.magnetismService.isMagnetismToggled ? this.drawingService.gridSquareSize / DISTANCE_MAGNETISM : DISTANCE;
        this.keys.forEach((value: boolean, key: string) => {
            if (value === true) {
                switch (key) {
                    case 'ArrowLeft':
                        direction.x += -distance;
                        break;
                    case 'ArrowRight':
                        direction.x += distance;
                        break;
                    case 'ArrowUp':
                        direction.y += -distance;
                        break;
                    case 'ArrowDown':
                        direction.y += distance;
                        break;
                }
            }
        });
        this.magnetismService.isMagnetismToggled
            ? this.magnetismService.snapSelectionToGrid(this.selection, direction.x, direction.y)
            : this.drawMovingSelection(direction.x, direction.y);
    }

    onMouseDown(event: MouseEvent): void {
        this.currentMousePosition = this.getPositionFromMouse(event);
        this.previousMousePosition = this.currentMousePosition;
    }

    drawMovingSelection(directionX: number, directionY: number): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.selection.updateDimensionsMove(directionX, directionY);

        if (this.isSelectionOutsideCanvas()) {
            directionX = -directionX;
            directionY = -directionY;
            this.selection.updateDimensionsMove(directionX, directionY);
        }

        this.selection.draw(this.drawingService.previewCtx);
    }

    onMouseMove(event: MouseEvent): void {
        const direction: Vec2 = { x: 0, y: 0 };
        this.currentMousePosition = this.getPositionFromMouse(event);
        direction.x = this.currentMousePosition.x - this.previousMousePosition.x;
        direction.y = this.currentMousePosition.y - this.previousMousePosition.y;
        this.magnetismService.isMagnetismToggled
            ? this.magnetismService.snapSelectionToGrid(this.selection, direction.x, direction.y)
            : this.drawMovingSelection(direction.x, direction.y);
        this.previousMousePosition = this.currentMousePosition;
    }

    isSelectionOutsideCanvas(): boolean {
        const x = this.selection.boundingBox.rectangle.x;
        const y = this.selection.boundingBox.rectangle.y;
        const width = this.selection.boundingBox.rectangle.width;
        const height = this.selection.boundingBox.rectangle.height;
        return x + width >= this.drawingService.canvas.width || y + height >= this.drawingService.canvas.height || x <= 0 || y <= 0;
    }
}
