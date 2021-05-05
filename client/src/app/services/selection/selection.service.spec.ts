import { TestBed } from '@angular/core/testing';
import { ActionObject } from '@app/classes/action-object/action-object';
import { ActionRectangleSelection } from '@app/classes/action-object/action-rectangle-selection/action-rectangle-selection';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { BoundingBox } from '@app/classes/selections/bounding-box/bounding-box';
import { EllipseSelection } from '@app/classes/selections/ellipse-selection/ellipse-selection';
import { RectangleSelection } from '@app/classes/selections/rectangle-selection/rectangle-selection';
import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { Vec2 } from '@app/classes/vec2';
import { DrawType } from '@app/constants/draw-type';
import { MouseButton } from '@app/constants/mouse-button';
import { ToolName } from '@app/constants/tool-name';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MoveSelectionService } from '@app/services/move-selection/move-selection.service';
import { ResizeSelectionService } from '@app/services/resize-selection/resize-selection.service';
import { SelectionService } from '@app/services/selection/selection.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { BehaviorSubject } from 'rxjs';

describe('SelectionService', () => {
    // tslint:disable: no-any
    // tslint:disable:no-string-literal
    // tslint:disable:no-magic-numbers
    // tslint:disable: max-file-line-count
    // reason: Tests setup (the same reason applies to other tslints in the file)
    let service: SelectionService;
    let canvasTestHelper: CanvasTestHelper;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let selectionSpy: jasmine.SpyObj<RectangleSelection>;
    let mouseEventLClick: MouseEvent;
    let mouseEventRClick: MouseEvent;

    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let canvasStub: HTMLCanvasElement;
    let createSelectionSpy: jasmine.Spy<any>;
    let drawSelectionSpy: jasmine.Spy<any>;
    let undoRedoSpy: jasmine.SpyObj<UndoRedoService>;
    let moveSelectionServiceSpy: jasmine.SpyObj<MoveSelectionService>;
    let createImageMoveSelectObjectSpy: jasmine.Spy<any>;
    let actionRectangleSelectionSpy: jasmine.SpyObj<ActionRectangleSelection>;
    let getPositionFromMouseSpy: jasmine.Spy<any>;
    let onInitSpy: jasmine.Spy<any>;

    let strokeThickness: number;
    let attributes: ShapeAttribute;
    let primaryColor: string;
    let secondaryColor: string;

    let resizeSelectionServiceSpy: jasmine.SpyObj<ResizeSelectionService>;
    let selectAllPixelsSpy: jasmine.Spy<any>;
    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'getPrimaryColor', 'getSecondaryColor']);
        selectionSpy = jasmine.createSpyObj('RectangleSelection', [
            'updateDimensions',
            'setLineDash',
            'resetLineDash',
            'draw',
            'contains',
            'updateDimensionsMove',
            'saveSelectedPixels',
            'createActionObject',
        ]);
        undoRedoSpy = jasmine.createSpyObj('UndoRedoService', ['addAction', 'undoAction']);
        actionRectangleSelectionSpy = jasmine.createSpyObj('ActionRectangleSelection', ['setImageMoveSelect', 'getImageMoveSelect']);
        resizeSelectionServiceSpy = jasmine.createSpyObj('ResizeSelectionService', [
            'onInit',
            'onKeyDown',
            'onKeyUp',
            'onMouseDown',
            'onMouseUp',
            'onMouseMove',
        ]);
        moveSelectionServiceSpy = jasmine.createSpyObj('MoveSelectionService', [
            'onInit',
            'onKeyDown',
            'onMouseDown',
            'onMouseMove',
            'isSelectionOutsideCanvas',
            'onKeyUp',
        ]);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: RectangleSelection, useValue: selectionSpy },
                { provide: UndoRedoService, useValue: undoRedoSpy },
                { provide: ActionRectangleSelection, useValue: actionRectangleSelectionSpy },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        canvasStub = canvasTestHelper.canvas;

        service = TestBed.inject(SelectionService);
        selectAllPixelsSpy = spyOn<any>(service, 'selectAllPixels').and.callThrough();
        createSelectionSpy = spyOn<any>(service, 'createSelection').and.callThrough();
        drawSelectionSpy = spyOn<any>(service, 'drawSelection').and.callThrough();
        createImageMoveSelectObjectSpy = spyOn<any>(service, 'createImageMoveSelectObject').and.callThrough();
        getPositionFromMouseSpy = spyOn<any>(service, 'getPositionFromMouse').and.callThrough();
        onInitSpy = spyOn<any>(service, 'onInit').and.callThrough();
        service['drawingService'] = drawServiceSpy;
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].canvas = canvasStub;

        service['selection'] = selectionSpy;
        service['moveSelectionService'] = moveSelectionServiceSpy;
        service['resizeSelectionService'] = resizeSelectionServiceSpy;

        service['undoRedoService'] = undoRedoSpy;

        service['undoRedoService'].actions = [];
        service['undoRedoService'].content = new BehaviorSubject<ActionObject[]>(service['undoRedoService'].actions);
        service['undoRedoService'].actions.push(service['selection'].createActionObject());
        service['undoRedoService'].actions[service['undoRedoService'].actions.length - 1] = actionRectangleSelectionSpy;

        strokeThickness = 0.5;
        attributes = new ShapeAttribute(strokeThickness, DrawType.Outline);
        primaryColor = 'black';
        secondaryColor = 'black';

        mouseEventLClick = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;

        mouseEventRClick = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Right,
        } as MouseEvent;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('selectMode should call createSelectionchange the name property', () => {
        const name = ToolName.RectangleSelection;
        service.onInit(name);
        expect(service.name).toBe(name);
        expect(service['isSelected']).toEqual(false);
        expect(createSelectionSpy).toHaveBeenCalled();
    });

    it('createSelection should change the selection to the type RectangleSelection if the name is right', () => {
        service.name = ToolName.RectangleSelection;
        const mousePosition: Vec2 = { x: 0, y: 0 };
        service.createSelection(mousePosition);
        expect(service['selection'] instanceof RectangleSelection).toBe(true);
    });

    it('createSelection should change the selection to the type Ellipse if the name is right', () => {
        service.name = ToolName.EllipseSelection;
        const mousePosition: Vec2 = { x: 0, y: 0 };
        service.createSelection(mousePosition);
        expect(service['selection'] instanceof EllipseSelection).toBe(true);
    });

    it('onKeydown should call draw selection if mouseDown is true and shift key is pressed', () => {
        service.mouseDown = true;
        const keyDownEvent = new KeyboardEvent('keydown', { key: 'shift', shiftKey: true });
        service.onKeyDown(keyDownEvent);
        expect(service.mouseDown).toBe(true);
        expect(service['isShiftPressed']).toBe(true);
        expect(drawSelectionSpy).toHaveBeenCalled();
    });

    it('onKeydown should not call draw selection if mouseDown is true and shift key is not pressed', () => {
        service.mouseDown = true;
        const keyDownEvent = new KeyboardEvent('keydown', { key: 'shift', shiftKey: false });
        service.onKeyDown(keyDownEvent);
        service['isShiftPressed'] = false;
        expect(service.mouseDown).toBe(true);
        expect(service['isShiftPressed']).toBe(false);
        expect(drawSelectionSpy).not.toHaveBeenCalled();
    });

    it('onKeydown should call createImageMoveSelectObject if escape key is pressed ', () => {
        service.onInit(ToolName.RectangleSelection);
        const keyDownEvent = new KeyboardEvent('keydown', { key: 'Escape' });
        service['moveSelectionService'].selection = service['selection'];
        service.mouseDown = false;
        service['moveSelectionService'].isDragging = true;
        service['isShiftPressed'] = false;
        service.onKeyDown(keyDownEvent);
        expect(service.mouseDown).toBe(false);
        expect(service['isShiftPressed']).toBe(false);
        expect(service.mouseDownCoord).toEqual({ x: 0, y: 0 });
        expect(createImageMoveSelectObjectSpy).toHaveBeenCalled();
    });

    it('onKeydown should call resizeSelectionService.onKeyDown if resizeSelectionService.isResizing is true ', () => {
        service.onInit(ToolName.RectangleSelection);
        const keyDownEvent = new KeyboardEvent('keydown', { shiftKey: true });
        service['isSelected'] = true;
        service['resizeSelectionService'].isResizing = true;
        service['moveSelectionService'].selection = service['selection'];
        service.mouseDown = true;
        service.onKeyDown(keyDownEvent);
        expect(resizeSelectionServiceSpy.onKeyDown).toHaveBeenCalled();
    });

    it('onKeydown should call moveSelectionService.onInit and onKeyDown if moveSelectionService.isDragging is false and key is an arrow', () => {
        service.onInit(ToolName.RectangleSelection);
        const keyDownEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        service['isSelected'] = true;
        service['moveSelectionService'].isDragging = false;
        service.mouseDown = false;
        service.onKeyDown(keyDownEvent);
        expect(moveSelectionServiceSpy.onInit).toHaveBeenCalled();
        expect(moveSelectionServiceSpy.onKeyDown).toHaveBeenCalled();
    });

    it('onKeydown should call createSelection using mouseDownCoord property if mouseDown is false and boolean returns false', () => {
        const keyDownEvent = new KeyboardEvent('keydown', { key: 'Escape' });
        service['undoRedoService'].actions.push(service['selection'].createActionObject());
        service.mouseDown = false;
        service['isShiftPressed'] = false;
        service['isSelected'] = true;
        service.onKeyDown(keyDownEvent);
        expect(service.mouseDown).toBe(false);
        expect(service['isShiftPressed']).toBe(false);
        expect(service['isSelected']).toBe(false);
        expect(service.mouseDownCoord).toEqual({ x: 0, y: 0 });
        expect(undoRedoSpy.undoAction).toHaveBeenCalled();
        expect(onInitSpy).toHaveBeenCalled();
    });

    it('onKeydown should call selectAllPixels if ctrl + a is pressed', () => {
        const keyDownEvent = new KeyboardEvent('keydown', { key: 'a', ctrlKey: true });
        service.mouseDown = false;

        const preventDefaultSpy = spyOn<any>(keyDownEvent, 'preventDefault').and.callThrough();
        service.onKeyDown(keyDownEvent);
        expect(preventDefaultSpy).toHaveBeenCalled();
        expect(selectAllPixelsSpy).toHaveBeenCalled();
    });

    it('onKeyUp should set iShiftPressed to false and call drawSelection', () => {
        service.mouseDown = true;
        const keyUpEvent = new KeyboardEvent('keyup', { key: 'shift', shiftKey: false });
        service.onKeyUp(keyUpEvent);
        expect(service['isShiftPressed']).toBe(false);
        expect(selectionSpy.updateDimensions).toHaveBeenCalled();
        expect(drawSelectionSpy).toHaveBeenCalledWith();
    });

    it('onKeyUp should call moveSelection.onKeyUp if isSelected is true and event.key is an arrow', () => {
        service.mouseDown = false;
        service['moveSelectionService'].isDragging = true;
        const keyUpEvent = new KeyboardEvent('keyup', { key: 'ArrowLeft' });
        service.onKeyUp(keyUpEvent);
        expect(moveSelectionServiceSpy.onKeyUp).toHaveBeenCalled();
    });

    it('onKeyUp should call resizeSelectionService.onKeyUp if isSelected is true and shift key is not pressed', () => {
        service.mouseDown = true;
        service['isSelected'] = true;
        service['resizeSelectionService'].isResizing = true;
        const keyUpEvent = new KeyboardEvent('keyup', { shiftKey: false });
        service.onKeyUp(keyUpEvent);
        expect(resizeSelectionServiceSpy.onKeyUp).toHaveBeenCalled();
    });

    it(' onMouseDown should set mouseDown property to true on left click', () => {
        service.onMouseDown(mouseEventLClick);
        expect(service.mouseDown).toEqual(true);
    });

    it(' onMouseDown should set mouseDown property to false on right click', () => {
        service.onMouseDown(mouseEventRClick);
        expect(service.mouseDown).toEqual(false);
    });

    it(' onMouseDown should set currentMousePosition to mouseDownCoord on left click', () => {
        service.onMouseDown(mouseEventLClick);
        expect(getPositionFromMouseSpy).toHaveBeenCalled();
        expect(service['currentMousePosition']).toEqual(service['mouseDownCoord']);
        expect(service.mouseDown).toEqual(true);
    });

    it(' onMouseDown should call createSelection if isSelected is false on left click', () => {
        service['isSelected'] = false;
        service.onMouseDown(mouseEventLClick);
        expect(createSelectionSpy).toHaveBeenCalled();
    });

    it(' onMouseDown should call resizeSelectionService.onMouseDown if isSelected is true', () => {
        service.onInit(ToolName.RectangleSelection);
        service['isSelected'] = true;
        service['mouseDown'] = true;
        service['selection'].boundingBox.createControlPoints();

        const mouseEventClick = {
            offsetX: 0,
            offsetY: 0,
            button: MouseButton.Left,
        } as MouseEvent;
        service.onMouseDown(mouseEventClick);
        expect(resizeSelectionServiceSpy.onInit).toHaveBeenCalled();
        expect(resizeSelectionServiceSpy.onMouseDown).toHaveBeenCalled();
    });

    it(' onMouseDown should call createImageMoveSelectObject if mouseDownCoord is not inside the selection and moveSelectionService.isDragging is true', () => {
        service.onInit(ToolName.RectangleSelection);
        service['selection'].boundingBox.createControlPoints();
        service['isSelected'] = true;
        service['moveSelectionService'].isDragging = true;
        service.onMouseDown(mouseEventLClick);
        expect(createImageMoveSelectObjectSpy).toHaveBeenCalled();
    });

    it(' onMouseDown should call undoAction, clearCanvas and createSelection if mouseDownCoord is not inside the selection and moveSelectionService.isDragging is false', () => {
        service.onInit(ToolName.RectangleSelection);
        service['selection'].boundingBox.createControlPoints();
        service['isSelected'] = true;
        service.onMouseDown(mouseEventLClick);
        expect(service['isSelected']).toBe(false);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalledWith(service['drawingService'].previewCtx);
        expect(undoRedoSpy.undoAction).toHaveBeenCalled();
        expect(createSelectionSpy).toHaveBeenCalledWith(service.mouseDownCoord);
    });

    it(' onMouseDown should call moveSelectionService.onMouseDown if mouseDownCoord is inside selection', () => {
        service.onInit(ToolName.RectangleSelection);
        service['selection'].boundingBox.createControlPoints();
        // tslint:disable: no-magic-numbers
        service['selection'].boundingBox.rectangle.width = 50;
        service['selection'].boundingBox.rectangle.height = 50;

        service['isSelected'] = true;
        service.onMouseDown(mouseEventLClick);
        expect(moveSelectionServiceSpy.onMouseDown).toHaveBeenCalled();
    });

    it(' onMouseMove should call moveSelectionService.onMouseMove if mouseDown and moveSelectionService.isDragging are true', () => {
        service.onInit(ToolName.RectangleSelection);
        service['moveSelectionService'].selection = service['selection'];
        const oldCurrentMousePosition = service['currentMousePosition'];

        service.mouseDown = true;
        service['moveSelectionService'].isDragging = true;
        service.onMouseMove(mouseEventLClick);
        expect(service['currentMousePosition']).not.toEqual(oldCurrentMousePosition);
        expect(getPositionFromMouseSpy).toHaveBeenCalled();
        expect(moveSelectionServiceSpy.onMouseMove).toHaveBeenCalled();
    });

    it(' onMouseMove should call drawSelection if mouseDown is true and moveSelectionService.isDragging is false', () => {
        service.onInit(ToolName.RectangleSelection);
        service['moveSelectionService'].selection = service['selection'];
        const oldCurrentMousePosition = service['currentMousePosition'];

        service.mouseDown = true;
        service['moveSelectionService'].isDragging = false;
        service.onMouseMove(mouseEventLClick);
        expect(service['currentMousePosition']).not.toEqual(oldCurrentMousePosition);
        expect(getPositionFromMouseSpy).toHaveBeenCalled();
        expect(drawSelectionSpy).toHaveBeenCalled();
    });

    it(' onMouseUp should set mouseDown to false', () => {
        service.mouseDown = true;
        service.onMouseUp(mouseEventLClick);
        expect(service.mouseDown).toBe(false);
    });

    it(' onMouseUp should call clear-reset-save-draw if isSelected is false', () => {
        service['isSelected'] = false;
        service.mouseDown = true;
        service['currentMousePosition'] = { x: 50, y: 50 };

        service['selection'].boundingBox = new BoundingBox(service['currentMousePosition'], attributes, primaryColor, secondaryColor);
        service['selection'].boundingBox.rectangle.width = 1;
        service['selection'].boundingBox.rectangle.height = 1;

        service.onMouseUp(mouseEventLClick);
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalledWith(service['drawingService'].previewCtx);
        expect(selectionSpy.resetLineDash).toHaveBeenCalledWith(service['drawingService'].previewCtx);
        expect(selectionSpy.saveSelectedPixels).toHaveBeenCalledWith(service['drawingService'].baseCtx);
        expect(selectionSpy.draw).toHaveBeenCalledWith(service['drawingService'].previewCtx);
        expect(service.mouseDown).toBe(false);
        expect(service['isSelected']).toBe(true);
    });

    it(' onMouseUp should call resizeSelectionService.onMouseUp if isSelected is true and resizeSelectionService.isResizing is true', () => {
        service['isSelected'] = true;
        service.mouseDown = true;
        service['currentMousePosition'] = { x: 50, y: 50 };
        service['resizeSelectionService'].isResizing = true;

        service['selection'].boundingBox = new BoundingBox(service['currentMousePosition'], attributes, primaryColor, secondaryColor);
        service['selection'].boundingBox.rectangle.width = 1;
        service['selection'].boundingBox.rectangle.height = 1;

        service.onMouseUp(mouseEventLClick);
        expect(resizeSelectionServiceSpy.onMouseUp).toHaveBeenCalled();
    });

    it(' onMouseUp should not call resizeSelectionService.onMouseUp if isSelected is false', () => {
        service['isSelected'] = false;
        service.mouseDown = true;
        service['currentMousePosition'] = { x: 50, y: 50 };
        service['resizeSelectionService'].isResizing = true;

        service['selection'].boundingBox = new BoundingBox(service['currentMousePosition'], attributes, primaryColor, secondaryColor);
        service['selection'].boundingBox.rectangle.width = 1;
        service['selection'].boundingBox.rectangle.height = 1;

        service.onMouseUp(mouseEventLClick);
        expect(resizeSelectionServiceSpy.onMouseUp).not.toHaveBeenCalled();
    });

    it(' onMouseUp should add an ActionRectangleSelection or ActionEllipseSelection to the undoredo service actions array', () => {
        service['isSelected'] = false;
        service.mouseDown = true;
        service['currentMousePosition'] = { x: 50, y: 50 };

        service['selection'].boundingBox = new BoundingBox(service['currentMousePosition'], attributes, primaryColor, secondaryColor);
        service['selection'].boundingBox.rectangle.width = 1;
        service['selection'].boundingBox.rectangle.height = 1;

        service.onMouseUp(mouseEventLClick);
        expect(selectionSpy.createActionObject).toHaveBeenCalled();
        expect(undoRedoSpy.addAction).toHaveBeenCalled();
        expect(service.mouseDown).toBe(false);
        expect(service['isSelected']).toBe(true);
    });

    it('drawSelection should call selection.draw', () => {
        service.drawSelection();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalledWith(service['drawingService'].previewCtx);
        expect(selectionSpy.updateDimensions).toHaveBeenCalled();
        expect(selectionSpy.setLineDash).toHaveBeenCalledWith(service['drawingService'].baseCtx);
        expect(selectionSpy.draw).toHaveBeenCalledWith(service['drawingService'].previewCtx);
    });

    it(' createImageMoveSelectObject should call setImageMoveSelect, undoredoService.next, drawingService.clearCanvas and createSelection', () => {
        service.onInit(ToolName.RectangleSelection);
        service['isSelected'] = true;
        service['selection'].boundingBox = new BoundingBox(service['currentMousePosition'], attributes, primaryColor, secondaryColor);
        service['selection'].boundingBox.rectangle.width = 1;
        service['selection'].boundingBox.rectangle.height = 1;

        service.createImageMoveSelectObject();
        expect(actionRectangleSelectionSpy.setImageMoveSelect).toHaveBeenCalled();
    });

    it('onToolChange should call undoRedoService.undoAction if isSelected is true', () => {
        service.onInit(ToolName.RectangleSelection);
        service['isSelected'] = true;
        service.onToolChange();
        expect(undoRedoSpy.undoAction).toHaveBeenCalled();
        expect(onInitSpy).toHaveBeenCalled();
    });

    it('selectAllPixels should call drawingService.clearCanvas', () => {
        service.onInit(ToolName.RectangleSelection);
        service['isSelected'] = true;
        service.selectAllPixels();
        expect(drawServiceSpy.clearCanvas).toHaveBeenCalledWith(previewCtxStub);
    });

    it('setCurrentMousePosition should set currentMousePosition property', () => {
        service['currentMousePosition'] = { x: 0, y: 0 };
        const newPosition = { x: 5, y: 5 };
        service.setCurrentMousePosition(newPosition);
        expect(service['currentMousePosition']).toEqual(newPosition);
    });

    it('setIsDragging should set moveSelectionService.isDragging property', () => {
        service['moveSelectionService'].isDragging = false;
        const newBool = true;
        service.setIsDragging(newBool);
        expect(service['moveSelectionService'].isDragging).toEqual(newBool);
    });
});
