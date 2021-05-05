import { Injectable } from '@angular/core';
import { ActionObject } from '@app/classes/action-object/action-object';
import { ActionShape } from '@app/classes/action-object/action-shape/action-shape';
import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { Text } from '@app/classes/shapes/text/text';
import { Tool } from '@app/classes/tool';
import { MouseButton } from '@app/constants/mouse-button';
import { ToolName } from '@app/constants/tool-name';
import { AttributeEditorService } from '@app/services/attribute-editor/attribute-editor.service';
import { ColorPickerService } from '@app/services/color/color-picker/color-picker.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';

@Injectable({
    providedIn: 'root',
})
export class TextService extends Tool {
    textLeft: number;
    textTop: number;
    text: string[];
    isWriting: boolean;
    positionX: number;
    positionY: number;
    biggestWidth: number;

    constructor(
        drawingService: DrawingService,
        private attributeEditorService: AttributeEditorService,
        private undoRedoService: UndoRedoService,
        private colorPickerService: ColorPickerService,
    ) {
        super(drawingService);
        this.name = ToolName.Text;
        this.positionX = 0;
        this.positionY = 0;
        this.text = new Array();
        this.text[0] = '';
        this.shape = new Text(
            { x: this.positionX, y: this.positionY },
            attributeEditorService.attributes,
            this.drawingService.getPrimaryColor(),
            this.drawingService.getSecondaryColor(),
            this.attributeEditorService.attributes.textAttributes.textSize,
            this.attributeEditorService.attributes.textAttributes.textBold,
            this.attributeEditorService.attributes.textAttributes.textItalic,
            this.attributeEditorService.attributes.textAttributes.textFont,
            this.attributeEditorService.attributes.textAttributes.textAlign,
            this.text,
        );
        this.attributeEditorService.share.subscribe((attributes: ShapeAttribute) => {
            this.updateText();
        });

        this.colorPickerService.share.subscribe((primaryColor: string) => {
            this.updateText();
        });
    }

    onMouseDown(event: MouseEvent): void {
        if (event.button === MouseButton.Left && !this.clickIsInsideText(event)) {
            if (!this.isArrayEmpty()) {
                this.finishText();
                return; // if return, first click finishes Text, second click makes new text
            }
            // new Text
            this.isWriting = true;
            this.positionX = 0;
            this.positionY = 0;
            this.text = new Array();
            this.text[0] = '';
            this.usesKeyboard = true;
            this.textLeft = this.getPositionFromMouse(event).x;
            this.textTop = this.getPositionFromMouse(event).y;
            this.drawingService.clearCanvas(this.drawingService.previewCtx);
            this.shape = new Text(
                { x: 0, y: 0 },
                this.attributeEditorService.attributes,
                this.drawingService.getPrimaryColor(),
                this.drawingService.getSecondaryColor(),
                this.attributeEditorService.attributes.textAttributes.textSize,
                this.attributeEditorService.attributes.textAttributes.textBold,
                this.attributeEditorService.attributes.textAttributes.textItalic,
                this.attributeEditorService.attributes.textAttributes.textFont,
                this.attributeEditorService.attributes.textAttributes.textAlign,
                this.text,
            );
            this.displayCursor();
        }
    }

    updateText(): void {
        if (!this.drawingService.previewCtx) {
            return;
        }
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.shape = new Text(
            { x: this.textLeft, y: this.textTop },
            this.attributeEditorService.attributes,
            this.drawingService.getPrimaryColor(),
            this.drawingService.getSecondaryColor(),
            this.attributeEditorService.attributes.textAttributes.textSize,
            this.attributeEditorService.attributes.textAttributes.textBold,
            this.attributeEditorService.attributes.textAttributes.textItalic,
            this.attributeEditorService.attributes.textAttributes.textFont,
            this.attributeEditorService.attributes.textAttributes.textAlign,
            this.text,
        );
        this.shape.drawPreview(this.drawingService.previewCtx);
        this.displayCursor();
    }

    finishText(): void {
        this.drawingService.clearCanvas(this.drawingService.previewCtx);
        this.usesKeyboard = false;
        const actionShape: ActionObject = new ActionShape(this.shape);
        this.undoRedoService.addAction(actionShape);
        this.text = new Array();
        this.isWriting = false;
        return;
    }

    isArrayEmpty(): boolean {
        for (const line of this.text) {
            if (line !== '') {
                return false;
            }
        }
        return true;
    }

    onToolChange(): void {
        if (!this.isWriting) {
            return;
        }
        this.finishText();
        return;
    }

    updateBiggestWidth(): void {
        const ctx: CanvasRenderingContext2D = this.drawingService.previewCtx;
        for (const currentLine of this.text) {
            if (ctx.measureText(currentLine).width > this.biggestWidth) {
                this.biggestWidth = ctx.measureText(currentLine).width;
            }
        }
    }
    clickIsInsideText(event: MouseEvent): boolean {
        let textRight = this.textLeft;
        let textLeftWithOffset = 0;
        this.biggestWidth = 0;
        this.updateBiggestWidth();
        const textTopOffset = this.textTop - this.attributeEditorService.attributes.textAttributes.textSize / 2;
        const textBottom = textTopOffset + this.text.length * this.attributeEditorService.attributes.textAttributes.textSize;
        switch (this.attributeEditorService.attributes.textAttributes.textAlign) {
            case 'left': {
                textRight = this.textLeft + this.biggestWidth;
                textLeftWithOffset = this.textLeft;
                break;
            }
            case 'center': {
                textRight = this.textLeft + this.biggestWidth / 2;
                textLeftWithOffset = this.textLeft - this.biggestWidth / 2;
                break;
            }
            case 'right': {
                textRight = this.textLeft;
                textLeftWithOffset = this.textLeft - this.biggestWidth;
                break;
            }
        }
        const x = this.getPositionFromMouse(event).x;
        const y = this.getPositionFromMouse(event).y;

        if (x >= textLeftWithOffset && x <= textRight && y >= textTopOffset && y <= textBottom) {
            return true;
        }
        return false;
    }
    displayCursor(): boolean {
        if (!this.isWriting) {
            return false;
        }
        const ctx = this.drawingService.previewCtx;
        let positionX = 0;
        const positionY =
            this.textTop -
            this.attributeEditorService.attributes.textAttributes.textSize / 2 +
            this.positionY * this.attributeEditorService.attributes.textAttributes.textSize;
        if (this.attributeEditorService.attributes.textAttributes.textAlign === 'left') {
            positionX = this.textLeft + ctx.measureText(this.text[this.positionY].substring(0, this.positionX)).width;
        }
        if (this.attributeEditorService.attributes.textAttributes.textAlign === 'right') {
            positionX = this.textLeft - ctx.measureText(this.text[this.positionY].substring(this.positionX, this.text[this.positionY].length)).width;
        }

        if (this.attributeEditorService.attributes.textAttributes.textAlign === 'center') {
            positionX =
                this.textLeft +
                ctx.measureText(this.text[this.positionY].substring(0, this.positionX)).width -
                ctx.measureText(this.text[this.positionY].substring(0, this.text[this.positionY].length)).width / 2;
        }
        ctx.fillStyle = 'black';
        ctx.fillRect(positionX, positionY - 1, 1, this.attributeEditorService.attributes.textAttributes.textSize / 2 + 2);
        ctx.fillStyle = 'white';
        ctx.fillRect(positionX + 1, positionY - 1, 1, this.attributeEditorService.attributes.textAttributes.textSize / 2 + 2);
        return true;
    }
    // tslint:disable-next-line: cyclomatic-complexity // reason: unfragmented switch case
    onKeyDown(event: KeyboardEvent): boolean {
        event.preventDefault();
        if (!this.isWriting) {
            return false;
        }
        switch (event.key) {
            case 'Escape':
                this.finishText();
                return false;
            case 'Backspace':
                if (this.positionX === 0) {
                    if (this.positionY === 0) {
                        return false;
                    }
                    const textAfterBack: string = this.text[this.positionY].slice(0, this.text[this.positionY].length);
                    this.positionY--;
                    this.text[this.positionY + 1] = '';
                    for (let i = this.positionY + 1; i < this.text.length; i++) {
                        if (this.text[i + 1] !== undefined) {
                            this.text[i] = this.text[i + 1];
                        } else {
                            this.text[i] = '';
                        }
                    }
                    this.positionX = this.text[this.positionY].length;
                    this.text[this.positionY] = this.text[this.positionY] + textAfterBack;
                    break;
                }
                this.positionX--;
                const newString: string =
                    this.text[this.positionY].slice(0, this.positionX) +
                    this.text[this.positionY].slice(this.positionX + 1, this.text[this.positionY].length);
                this.text[this.positionY] = newString;
                break;
            case 'Enter':
                const textBeforeEnter: string = this.text[this.positionY].slice(0, this.positionX);
                this.text[this.positionY] = this.text[this.positionY].slice(this.positionX, this.text[this.positionY].length);
                for (let i = this.text.length - 1; i >= this.positionY; i--) {
                    if (this.text[i] !== undefined) {
                        this.text[i + 1] = this.text[i];
                    }
                }
                this.text[this.positionY] = textBeforeEnter;
                this.positionY++;
                this.positionX = 0;
                break;
            case 'Delete':
                if (this.positionX === this.text[this.positionY].length) {
                    if (this.positionY === this.text.length - 1) return false;
                    this.text[this.positionY] += this.text[this.positionY + 1];
                    this.text[this.positionY + 1] = '';
                    for (let i = this.positionY + 1; i < this.text.length - 1; i++) {
                        if (this.text[i + 1] != undefined) {
                            this.text[i] = this.text[i + 1];
                        } else {
                            this.text[i] = '';
                        }
                    }
                    break;
                } else {
                    const deleteString: string =
                        this.text[this.positionY].slice(0, this.positionX) + this.text[this.positionY].slice(this.positionX + 1, this.text.length);
                    this.text[this.positionY] = deleteString;
                }
                break;
            case 'ArrowLeft':
                if (this.positionX > 0) this.positionX--;
                else {
                    if (this.positionY > 0) {
                        this.positionY--;
                        this.positionX = this.text[this.positionY].length;
                    }
                }
                break;
            case 'ArrowRight':
                if (this.text[this.positionY].length > this.positionX) this.positionX++;
                else {
                    if (this.positionY !== this.text.length - 1) {
                        this.positionY++;
                        this.positionX = 0;
                    }
                }
                break;
            case 'ArrowUp':
                if (this.positionY === 0) return false;
                this.positionY = this.positionY - 1;
                if (this.text[this.positionY].length < this.positionX) this.positionX = this.text[this.positionY].length;
                break;
            case 'ArrowDown':
                if (this.positionY === this.text.length - 1) return false;
                this.positionY = this.positionY + 1;
                if (this.text[this.positionY].length < this.positionX) this.positionX = this.text[this.positionY].length;
                break;
            default:
                if (this.isAlphaNumeric(event)) {
                    this.text[this.positionY] =
                        this.text[this.positionY].slice(0, this.positionX) +
                        event.key +
                        this.text[this.positionY].slice(this.positionX, this.text[this.positionY].length);

                    this.positionX++;
                } else {
                    return false;
                }
        }
        this.updateText();
        return true;
    }
    isAlphaNumeric(event: KeyboardEvent): boolean {
        if (event.key.length === 1) {
            return true;
        } else {
            return false;
        }
    }
}
