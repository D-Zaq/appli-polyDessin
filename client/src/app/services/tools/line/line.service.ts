import { Injectable } from '@angular/core';
import { ActionObject } from '@app/classes/action-object/action-object';
import { ActionShape } from '@app/classes/action-object/action-shape/action-shape';
// import { Coordinate } from '@app/classes/services/coordinate';
import { Line } from '@app/classes/shapes/line/line';
import { AbsShape } from '@app/classes/shapes/shape';
import { Tool } from '@app/classes/tool';
import { Vec2 } from '@app/classes/vec2';
import { MouseButton } from '@app/constants/mouse-button';
import { ToolName } from '@app/constants/tool-name';
import { AttributeEditorService } from '@app/services/attribute-editor/attribute-editor.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class LineService extends Tool {
    lines: AbsShape[];
    // line: Line;
    // in order to use image, maybe the good way of doing it should be by calling it every this a line is created
    // so basically, i save the canvas as soon as i create a line and then every time i erase, i redraw
    mouseDownCoord: Vec2;
    currMousePosition: Vec2;
    shiftedPosition: Vec2;
    isKeyPressed: boolean;
    startPreview: boolean;

    // junctionPoint: boolean; // for junction points
    // pointFilled: boolean;  // for filled points
    startingPoint: Vec2;
    endingPoint: Vec2;

    lastPositionX: number;
    lastPositionY: number;

    constructor(drawingService: DrawingService, public attributeEditorService: AttributeEditorService, public undoRedoService: UndoRedoService) {
        super(drawingService);
        this.lines = [];
        this.shape = new Line(false, this.attributeEditorService.attributes, 'black', 'black');
        this.shape.clearPath();
        this.startPreview = false;
        this.name = ToolName.Line;
        this.shiftedPosition = { x: 0, y: 0 };
        this.isKeyPressed = false;
    }

    onKeyDown(event: KeyboardEvent): void {
        // erase the current drawing when the touch ESCAPE is pressed down
        if (event.key === 'Escape') {
            this.startPreview = false;
            this.eraseDrawing(this.drawingService.previewCtx);
        }
        if (event.key === 'Backspace') {
            // when the lenght of the array pathData equals 1, we ignore the event BACKSPACE
            if (this.shape.getPathData().length <= 1) {
                return;
            }
            // When the button BACKSPACE is pressed, we erase the last segement
            this.deleteLastSegement(this.drawingService.previewCtx); // use clear canvas
            this.redrawPreviewLine();
        }

        if (event.shiftKey) {
            this.isKeyPressed = true;
        }
    }

    onKeyUp(event: KeyboardEvent): void {
        if (!event.shiftKey) {
            this.isKeyPressed = false;
        }
    }

    onDblClick(event: MouseEvent): void {
        // First we save canvas images
        const numberOfPixels = 20;
        this.drawingService.clearCanvas(this.drawingService.previewCtx);

        const actionShape: ActionObject = new ActionShape(this.shape);
        this.undoRedoService.addAction(actionShape);

        this.shape = new Line(false, this.attributeEditorService.attributes, 'black', 'black');

        // if the distance between the ending and starting point of the path is < or equal 20 pixels
        if (this.shape.calculateDistance(this.startingPoint, this.endingPoint) <= numberOfPixels) {
            // we will close the path
            this.shape.closeDrawing(this.drawingService.baseCtx);
        }

        // we stop previewing the drawing
        this.startPreview = false;
        this.mouseDown = false;
    }

    onMouseDown(event: MouseEvent): void {
        this.mouseDown = event.button === MouseButton.Left;
        if (this.mouseDown) {
            // we can start the preview
            this.startPreview = true;
            const coord = this.getPositionFromMouse(event);

            this.mouseDownCoord = coord;
            if (this.isKeyPressed) {
                this.mouseDownCoord = this.shiftedPosition;
            }
            this.startingPoint = this.shape.getPathData()[0];
            this.endingPoint = coord;
            this.shape.getPathData().push(this.mouseDownCoord);
            // i thought about using two array but i don't think that's necessary
            this.shape.draw(this.drawingService.previewCtx);
        }
    }

    onMouseMove(event: MouseEvent): void {
        this.currMousePosition = this.getPositionFromMouse(event);
        this.shiftedPosition = this.currMousePosition;

        if (this.isKeyPressed) {
            this.currMousePosition = this.shiftedPosition;
        }

        if (this.startPreview) {
            this.drawPreviewLine(this.drawingService.previewCtx, this.currMousePosition);
            this.calculateShiftedPosition();
            this.lastPositionX = this.currMousePosition.x;
            this.lastPositionY = this.currMousePosition.y;
            if (this.isKeyPressed) {
                this.drawPreviewLine(this.drawingService.previewCtx, this.currMousePosition);
                this.lastPositionX = this.currMousePosition.x;
                this.lastPositionY = this.currMousePosition.y;
            }
        }
    }

    calculateShiftedPosition(): void {
        const divider = 4;
        const deltaX = this.currMousePosition.x - this.mouseDownCoord.x;
        const deltaY = this.currMousePosition.y - this.mouseDownCoord.y;

        const distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));

        // this will get the angle formed by the two points
        const newAngle = Math.atan2(deltaY, deltaX);
        // the angle gets transformed into a multiple of PI/4
        const shiftedAngle = (Math.round((newAngle / Math.PI) * divider) / divider) * Math.PI;
        // we move to the nearest position of pi/4
        const positionX = this.mouseDownCoord.x + distance * Math.cos(shiftedAngle);
        const positionY = this.mouseDownCoord.y + distance * Math.sin(shiftedAngle);
        this.shiftedPosition.x = positionX;
        this.shiftedPosition.y = positionY;
    }

    // maybe i should use the logic of having an axe or a line rotating around

    drawPreviewLine(ctx: CanvasRenderingContext2D, position: Vec2): void {
        ctx.save();

        ctx.lineWidth = this.attributeEditorService.attributes.strokeThickness;
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.beginPath();
        this.shape.draw(ctx);
        ctx.moveTo(this.shape.getPathData()[this.shape.getPathData().length - 1].x, this.shape.getPathData()[this.shape.getPathData().length - 1].y);
        ctx.lineTo(position.x, position.y);
        ctx.stroke();

        ctx.restore();
    }

    redrawPreviewLine(): void {
        const position: Vec2 = { x: this.lastPositionX, y: this.lastPositionY };
        this.drawPreviewLine(this.drawingService.previewCtx, position);
    }

    // this method will erase the current drawing
    eraseDrawing(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        this.shape = new Line(false, this.attributeEditorService.attributes, 'black', 'black');
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        this.lines.forEach((l) => {
            l.draw(ctx);
        });
        ctx.restore();
    }
    // this method will delete the last segment of the current line
    deleteLastSegement(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        this.lines.forEach((l) => {
            l.draw(ctx);
        });
        this.shape.delete(ctx);
        ctx.restore();
    }
}
