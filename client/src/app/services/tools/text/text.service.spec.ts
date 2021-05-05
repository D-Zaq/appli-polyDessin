import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Text } from '@app/classes/shapes/text/text';
import { ALPHA_INDEX, MAX_VALUE_8_BITS, OFFSETSIZE, SMALL_TEXT_SIZE } from '@app/constants/constants';
import { MouseButton } from '@app/constants/mouse-button';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { TextService } from './text.service';

describe('TextService', () => {
    let service: TextService;
    let textSpy: jasmine.SpyObj<Text>;
    let mouseEventLClick: MouseEvent;
    let mouseEventLClickFar: MouseEvent;

    let mouseEventRClick: MouseEvent;
    let buttonAClick: KeyboardEvent;
    let buttonSpaceClick: KeyboardEvent;
    let buttonEscapeClick: KeyboardEvent;
    let buttonBackspaceClick: KeyboardEvent;
    let buttonEnterClick: KeyboardEvent;
    let buttonDeleteClick: KeyboardEvent;
    let buttonArrowLeftClick: KeyboardEvent;
    let buttonArrowRightClick: KeyboardEvent;
    let buttonArrowUpClick: KeyboardEvent;
    let buttonArrowDownClick: KeyboardEvent;
    let buttonTabClick: KeyboardEvent;

    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let canvasStub: HTMLCanvasElement;
    let undoRedoSpy: jasmine.SpyObj<UndoRedoService>;

    // tslint:disable: no-any // reason: Testing spy
    let finishTextSpy: jasmine.Spy<any>;
    let displayCursorSpy: jasmine.Spy<any>;

    mouseEventLClick = {
        offsetX: 25,
        offsetY: 25,
        x: 25,
        y: 25,
        button: MouseButton.Left,
    } as MouseEvent;
    mouseEventLClickFar = {
        offsetX: 2500,
        offsetY: 2500,
        x: 2500,
        y: 2500,
        button: MouseButton.Left,
    } as MouseEvent;
    mouseEventRClick = {
        offsetX: 25,
        offsetY: 25,
        button: MouseButton.Right,
    } as MouseEvent;

    buttonAClick = new KeyboardEvent('Keydown', { key: 'a' });
    buttonSpaceClick = new KeyboardEvent('Keydown', { key: ' ' });

    buttonEscapeClick = new KeyboardEvent('Keydown', { key: 'Escape' });

    buttonBackspaceClick = new KeyboardEvent('Keydown', { key: 'Backspace' });

    buttonEnterClick = new KeyboardEvent('Keydown', { key: 'Enter' });

    buttonDeleteClick = new KeyboardEvent('Keydown', { key: 'Delete' });

    buttonArrowLeftClick = new KeyboardEvent('Keydown', { key: 'ArrowLeft' });

    buttonArrowRightClick = new KeyboardEvent('Keydown', { key: 'ArrowRight' });

    buttonArrowUpClick = new KeyboardEvent('Keydown', { key: 'ArrowUp' });

    buttonArrowDownClick = new KeyboardEvent('Keydown', { key: 'ArrowDown' });

    buttonTabClick = new KeyboardEvent('Keydown', { key: 'Tab' });

    // tslint:disable: no-string-literal // reason: Tests

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'getPrimaryColor', 'getSecondaryColor']);
        textSpy = jasmine.createSpyObj('Text', ['draw', 'drawPreview', 'applyToCanvas']);
        undoRedoSpy = jasmine.createSpyObj('UndoRedoService', ['addAction']);

        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: Text, useValue: textSpy },
                { provide: UndoRedoService, useValue: undoRedoSpy },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);

        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        service = TestBed.inject(TextService);
        finishTextSpy = spyOn<any>(service, 'finishText').and.callThrough();
        displayCursorSpy = spyOn<any>(service, 'displayCursor').and.callThrough();

        service['drawingService'] = drawServiceSpy;
        service['drawingService'].baseCtx = baseCtxStub;
        service['drawingService'].canvas = canvasStub;
        service['shape'] = textSpy;
        canvasStub = canvasTestHelper.canvas;
    });
    it('should be created', () => {
        service['drawingService'].previewCtx = previewCtxStub;

        expect(service).toBeTruthy();
    });
    it('onMouseDown should do nothing if not left click', () => {
        service['drawingService'].previewCtx = previewCtxStub;

        service.onMouseDown(mouseEventRClick);

        expect(finishTextSpy).not.toHaveBeenCalled();
        expect(displayCursorSpy).not.toHaveBeenCalled();
    });
    it('onMouseDown should do nothing if click is inside text box', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service.onKeyDown(buttonAClick);
        service.onKeyDown(buttonAClick);
        service.onKeyDown(buttonAClick);
        service.onKeyDown(buttonAClick);
        service.onKeyDown(buttonEnterClick);
        service.onKeyDown(buttonEnterClick);
        service.onKeyDown(buttonEnterClick);
        service.onMouseDown(mouseEventLClick);
        expect(finishTextSpy).not.toHaveBeenCalled();
    });
    it('onMouseDown should finish text if array is not empty,and click is inside text box', () => {
        service['drawingService'].previewCtx = previewCtxStub;

        service.text = new Array();
        service.text[0] = 'test';
        service.onMouseDown(mouseEventLClickFar);
        expect(finishTextSpy).toHaveBeenCalled();
    });
    it('onMouseDown should make new text box if array is empty', () => {
        const oldShape = service['shape'];
        service['drawingService'].previewCtx = previewCtxStub;
        service.text = new Array();
        service.onMouseDown(mouseEventLClickFar);

        expect(oldShape).not.toBe(service['shape']);
    });

    it('updateText should return if no previewCtx', () => {
        service.updateText();
        expect(displayCursorSpy).not.toHaveBeenCalled();
    });
    it('updateText should update if there is previewCtx', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service.updateText();
        expect(displayCursorSpy).toHaveBeenCalled();
    });
    it('finishText should reset attributes', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service.usesKeyboard = true;
        service.isWriting = true;
        service.finishText();
        expect(service.usesKeyboard).toBe(false);
        expect(service.isWriting).toBe(false);
    });
    it('isArrayEmpty should return true if empty', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service.text = new Array();
        expect(service.isArrayEmpty()).toBe(true);
    });
    it('isArrayEmpty should return false if not empty', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service.text = new Array();
        service.text[0] = 'test';
        expect(service.isArrayEmpty()).toBe(false);
    });
    it('onToolChange should return if is not writing', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service.isWriting = false;
        service.onToolChange();
        expect(finishTextSpy).not.toHaveBeenCalled();
    });
    it('onToolChange should finish if is writing', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service.isWriting = true;
        service.onToolChange();
        expect(finishTextSpy).toHaveBeenCalled();
    });
    it('clickIsInsideText should cause break when alignment is left', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service['attributeEditorService'].attributes.textAttributes.textAlign = 'left';
        service.text[0] = 'test';
        service.biggestWidth = 0;
        service.clickIsInsideText(mouseEventLClick);
        expect(displayCursorSpy).not.toHaveBeenCalled();
    });
    it('clickIsInsideText should cause break when alignment is center', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service['attributeEditorService'].attributes.textAttributes.textAlign = 'center';
        service.text[0] = 'test';
        service.biggestWidth = 0;
        service.clickIsInsideText(mouseEventLClick);
        expect(displayCursorSpy).not.toHaveBeenCalled();
    });
    it('clickIsInsideText should cause break when alignment is right', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service['attributeEditorService'].attributes.textAttributes.textAlign = 'right';
        service.text[0] = 'test';
        service.biggestWidth = 0;
        service.clickIsInsideText(mouseEventLClick);
        expect(displayCursorSpy).not.toHaveBeenCalled();
    });
    it('clickIsInsideText should return true if inside text', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service['attributeEditorService'].attributes.textAttributes.textAlign = 'left';
        service['attributeEditorService'].attributes.textAttributes.textSize = SMALL_TEXT_SIZE;
        service.textLeft = OFFSETSIZE;
        service.textTop = OFFSETSIZE;
        service.onMouseDown(mouseEventLClick);
        service.text[0] = 't';
        for (let j = 0; j < MAX_VALUE_8_BITS; j++) {
            for (let i = 0; i < MAX_VALUE_8_BITS; i++) {
                service.onKeyDown(buttonAClick);
            }
            service.onKeyDown(buttonEnterClick);
        }
        expect(service.clickIsInsideText(mouseEventLClick)).toBe(true);
    });
    it('clickIsInsideText should return false if not inside text', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service['attributeEditorService'].attributes.textAttributes.textAlign = 'left';
        service['attributeEditorService'].attributes.textAttributes.textSize = 1;
        service.textLeft = OFFSETSIZE;
        service.textTop = OFFSETSIZE;
        service.onMouseDown(mouseEventLClick);
        service.text[0] = 't';
        expect(service.clickIsInsideText(mouseEventLClickFar)).toBe(false);
    });
    it('displayCursor should return true if writing', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service.isWriting = true;
        expect(service.displayCursor()).toBe(true);
    });
    it('displayCursor should return false if not writing', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service.isWriting = false;
        expect(service.displayCursor()).toBe(false);
    });
    it('displayCursor should display if alignment is right', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service['attributeEditorService'].attributes.textAttributes.textAlign = 'right';

        service.isWriting = true;
        service.displayCursor();

        expect(service.displayCursor()).toBe(true);
    });
    it('displayCursor should display if alignment is center', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service['attributeEditorService'].attributes.textAttributes.textAlign = 'center';

        service.isWriting = true;
        service.displayCursor();

        expect(service.displayCursor()).toBe(true);
    });
    it('onKeyDown should finish text if escape key is pressed', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service.isWriting = true;
        service.onKeyDown(buttonEscapeClick);
        expect(finishTextSpy).toHaveBeenCalled();
    });
    it('onKeyDown should do nothing if Backspace key is pressed and x and y are 0', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service.isWriting = true;
        service.text = new Array();
        service.text[0] = '';
        service.positionY = 0;
        service.positionX = 0;
        expect(service.onKeyDown(buttonBackspaceClick)).toBe(false);
    });
    it('onKeyDown should go back one line etc if Backspace key is pressed and x = 0 and y=1', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service.isWriting = true;
        service.positionY = 1;
        service.positionX = 0;
        service.text = new Array();
        service.text[0] = 'test';
        service.text[1] = 'test';
        service.text[2] = 'test';
        expect(service.onKeyDown(buttonBackspaceClick)).toBe(true);
    });
    it('onKeyDown should do normal backspace if Backspace key is pressed and x = 1 and y=1', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service.isWriting = true;
        service.positionY = 1;
        service.positionX = 1;
        service.text[0] = 'test';
        service.text[1] = 'test';
        service.text[2] = 'test';
        expect(service.onKeyDown(buttonBackspaceClick)).toBe(true);
    });

    it('onKeyDown  should go next line if is enter pressed', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service.isWriting = true;
        service.positionY = 0;
        service.positionX = 0;
        service.text = new Array();
        service.text[0] = 'test';
        expect(service.onKeyDown(buttonEnterClick)).toBe(true);
    });
    it('onKeyDown  should go next line if is enter pressed, even with undefined lines', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service.isWriting = true;
        service.positionY = 0;
        service.positionX = 0;
        service.text = new Array();
        service.text[0] = 'test';
        service.text[2] = 'test';
        expect(service.onKeyDown(buttonEnterClick)).toBe(true);
    });
    it('onKeyDown  should go next line if is enter pressed, even with undefined lines', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service.isWriting = true;
        service.positionY = 0;
        service.positionX = 0;
        service.text = new Array();
        service.text[0] = 'test';
        service.text[2] = 'test';

        service.onKeyDown(buttonEnterClick);
        expect(finishTextSpy).not.toHaveBeenCalled();
    });
    it('onKeyDown should delete if is pressed', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service.isWriting = true;
        service.text[0] = 'test';
        service.text[1] = 'test';
        service.text[2] = 'test';
        service.positionY = 0;
        service.positionX = 0;
        expect(service.onKeyDown(buttonDeleteClick)).toBe(true);
    });
    it('onKeyDown should delete if is pressed at end of line with defined line', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service.isWriting = true;
        service.text = new Array();

        service.text[0] = 'test';
        service.text[1] = 'test';
        service.positionY = 0;
        service.positionX = 2 * 2;
        expect(service.onKeyDown(buttonDeleteClick)).toBe(true);
    });
    it('onKeyDown should delete if is pressed at end of line with undefined line', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service.isWriting = true;
        service.text = new Array();

        service.text[0] = 'test';
        service.text[1] = 'test';
        service.text[ALPHA_INDEX - 1] = 'test';
        service.positionY = 0;
        service.positionX = ALPHA_INDEX;
        expect(service.onKeyDown(buttonDeleteClick)).toBe(true);
    });
    it('onKeyDown should not delete if end of text', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service.isWriting = true;
        service.text = new Array();

        service.text[0] = 'test';
        service.text[1] = 'test';
        service.text[2] = 'test';
        service.positionY = 2;
        service.positionX = ALPHA_INDEX;
        service.onKeyDown(buttonDeleteClick);
        expect(service.onKeyDown(buttonDeleteClick)).toBe(false);
    });
    it('onKeyDown should ArrowLeft if is pressed', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service.isWriting = true;
        service.text[0] = 'test';
        service.text[1] = 'test';
        service.text[2] = 'test';
        service.positionY = 0;
        service.positionX = 1;
        expect(service.onKeyDown(buttonArrowLeftClick)).toBe(true);
    });
    it('onKeyDown should ArrowLeft if is pressed at start of line', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service.isWriting = true;
        service.text[0] = 'test';
        service.text[1] = 'test';
        service.text[2] = 'test';
        service.positionY = 0;
        service.positionX = 0;
        expect(service.onKeyDown(buttonArrowLeftClick)).toBe(true);
    });

    it('onKeyDown should ArrowLeft if is pressed at start of line at line != 0', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service.isWriting = true;
        service.text[0] = 'test';
        service.text[1] = 'test';
        service.text[2] = 'test';
        service.positionY = 1;
        service.positionX = 0;
        expect(service.onKeyDown(buttonArrowLeftClick)).toBe(true);
    });
    it('onKeyDown should ArrowRight if is pressed', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service.isWriting = true;
        service.text[0] = 'test';
        service.text[1] = 'test';
        service.text[2] = 'test';
        service.positionY = 0;
        service.positionX = 0;
        expect(service.onKeyDown(buttonArrowRightClick)).toBe(true);
    });
    it('onKeyDown should ArrowRight if is pressed at end of line', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service.isWriting = true;
        service.text[0] = 'test';
        service.text[1] = 'test';
        service.text[2] = 'test';
        service.positionY = 0;
        service.positionX = ALPHA_INDEX;
        expect(service.onKeyDown(buttonArrowRightClick)).toBe(true);
    });
    it('onKeyDown should ArrowRight if is pressed at end of line and end of text', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service.isWriting = true;
        service.text[0] = 'test';
        service.text[1] = 'test';
        service.text[2] = 'test';
        service.positionY = 2;
        service.positionX = ALPHA_INDEX;
        expect(service.onKeyDown(buttonArrowRightClick)).toBe(true);
    });
    it('onKeyDown should ArrowUp if is pressed in middle of text', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service.isWriting = true;
        service.text[0] = 'test';
        service.text[1] = 'test';
        service.text[2] = 'test';
        service.positionY = 1;
        service.positionX = 1;
        expect(service.onKeyDown(buttonArrowUpClick)).toBe(true);
    });
    it('onKeyDown should ArrowUp if is pressed in middle of text, and previous line is shorter', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service.isWriting = true;
        service.text[0] = 't';
        service.text[1] = 'test';
        service.positionY = 1;
        service.positionX = ALPHA_INDEX - 1;
        expect(service.onKeyDown(buttonArrowUpClick)).toBe(true);
    });
    it('onKeyDown should ArrowUp and do nothing if first line', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service.isWriting = true;
        service.text[0] = 'test';
        service.text[1] = 'test';
        service.text[2] = 'test';
        service.positionY = 0;
        service.positionX = 1;
        expect(service.onKeyDown(buttonArrowUpClick)).toBe(false);
    });
    it('onKeyDown should ArrowUp if is pressed in middle of text, and previous line is shorter', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service.isWriting = true;
        service.text[0] = 't';
        service.text[1] = 'test';
        service.positionY = 1;
        service.positionX = ALPHA_INDEX - 1;
        service.onKeyDown(buttonArrowUpClick);
        expect(finishTextSpy).not.toHaveBeenCalled();
    });
    it('onKeyDown should ArrowUp and do nothing if first line', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service.isWriting = true;
        service.text[0] = 'test';
        service.text[1] = 'test';
        service.text[2] = 'test';
        service.positionY = 0;
        service.positionX = 1;
        service.onKeyDown(buttonArrowUpClick);
        expect(finishTextSpy).not.toHaveBeenCalled();
    });
    it('onKeyDown should ArrowDown if is pressed', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service.isWriting = true;
        service.text[0] = 'test';
        service.text[1] = 'test';
        service.text[2] = 'test';
        service.positionY = 0;
        service.positionX = 0;
        expect(service.onKeyDown(buttonArrowDownClick)).toBe(true);
    });
    it('onKeyDown should  not ArrowDown if is pressed at last line', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service.isWriting = true;
        service.text[0] = 'test';
        service.text[1] = 'test';
        service.text[2] = 'test';
        service.positionY = 2;
        service.positionX = 0;
        expect(service.onKeyDown(buttonArrowDownClick)).toBe(false);
    });
    it('onKeyDown should ArrowDown if is pressed in middle', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service.isWriting = true;
        service.text[0] = 'test';
        service.text[1] = 'test12';
        service.text[2] = 'test';
        service.positionY = 1;
        service.positionX = ALPHA_INDEX + 1;
        expect(service.onKeyDown(buttonArrowDownClick)).toBe(true);
    });
    it('onKeyDown should add alphanumeric', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service.isWriting = true;
        service.text[0] = 'test';
        service.text[1] = 'test12';
        service.text[2] = 'test';
        service.positionY = 2;
        service.positionX = ALPHA_INDEX;
        expect(service.onKeyDown(buttonAClick)).toBe(true);
        expect(service.text[2]).toBe('testa');
    });
    it('onKeyDown should add alphanumeric space', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service.isWriting = true;
        service.text[0] = 'test';
        service.text[1] = 'test12';
        service.text[2] = 'test';
        service.positionY = 2;
        service.positionX = ALPHA_INDEX;
        expect(service.onKeyDown(buttonSpaceClick)).toBe(true);
        expect(service.text[2]).toBe('test ');
    });
    it('onKeyDown should not add tab', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        service.isWriting = true;
        service.text[0] = 'test';
        service.text[1] = 'test12';
        service.text[2] = 'test';
        service.positionY = service.text.length - 1;
        service.positionX = service.text[service.positionY].length;
        expect(service.onKeyDown(buttonTabClick)).toBe(false);
        expect(service.text[2]).toBe('test');
    });
    it('isAlphaNumeric should return false if not alphaNumeric', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        expect(service.isAlphaNumeric(buttonEnterClick)).toBe(false);
    });
    it('isAlphaNumeric should return true if alphaNumeric a', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        expect(service.isAlphaNumeric(buttonAClick)).toBe(true);
    });
    it('isAlphaNumeric should return true if alphaNumeric space', () => {
        service['drawingService'].previewCtx = previewCtxStub;
        expect(service.isAlphaNumeric(buttonSpaceClick)).toBe(true);
    });
    // tslint:disable-next-line: max-file-line-count // reason: tests not fragmented
});
