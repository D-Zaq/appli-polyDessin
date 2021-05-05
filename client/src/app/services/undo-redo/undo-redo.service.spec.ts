import { TestBed } from '@angular/core/testing';
import { ActionObject } from '@app/classes/action-object/action-object';
import { ActionRectangleSelection } from '@app/classes/action-object/action-rectangle-selection/action-rectangle-selection';
import { ActionResize } from '@app/classes/action-object/action-resize/action-resize';
import { Rectangle } from '@app/classes/shapes/rectangle/rectangle';
import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { SIDE_BAR_WIDTH } from '@app/constants/constants';
import { DrawType } from '@app/constants/draw-type';
import { BehaviorSubject } from 'rxjs';
import { UndoRedoService } from './undo-redo.service';

describe('UndoRedoService', () => {
    // tslint:disable: no-string-literal
    // tslint:disable: no-any
    // tslint:disable: no-magic-numbers
    // reason: Tests configuration(the same reason applies to other tslints in the file)
    let service: UndoRedoService;
    let nextSpy: jasmine.Spy<any>;
    let undoActionSpy: jasmine.Spy<any>;
    let redoActionSpy: jasmine.Spy<any>;
    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(UndoRedoService);

        service.actions = [];
        service.removedActions = [];
        service.resizeActions = [];

        service.content = new BehaviorSubject<ActionObject[]>(service.actions);
        service.share = service.content.asObservable();

        service.isActionPopped = false;
        service.isPoppedActionResize = false;

        const firstResize = new ActionResize((window.innerWidth - SIDE_BAR_WIDTH) / 2, window.innerHeight / 2);
        service.actions.push(firstResize);
        service.resizeActions.push(firstResize);

        nextSpy = spyOn<any>(service.content, 'next').and.callThrough();
        undoActionSpy = spyOn<any>(service, 'undoAction').and.callThrough();
        redoActionSpy = spyOn<any>(service, 'redoAction').and.callThrough();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('addAction should add and action to the actions array', () => {
        service.addAction(new ActionResize(1, 1));
        expect(service.actions.length).toEqual(2);
        expect(service.resizeActions.length).toEqual(2);
        expect(service.removedActions.length).toEqual(0);
        expect(nextSpy).toHaveBeenCalledWith(service.actions);
    });

    it('onKeyDown should call undoAction if ctrlKey, z key are true and shift key is false', () => {
        const keyDownEvent = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, shiftKey: false });
        service.actions.push(new ActionResize(1, 1));
        service.onKeyDown(keyDownEvent);
        expect(undoActionSpy).toHaveBeenCalled();
    });

    it('onKeyDown should call undoAction if ctrlKey, z key are true and shift key is false', () => {
        const keyDownEvent = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, shiftKey: true });
        service.actions.push(new ActionResize(1, 1));
        service.onKeyDown(keyDownEvent);
        expect(redoActionSpy).toHaveBeenCalled();
    });

    it('undoAction should call content.next and should set isActionPopped and isPoppedActionResize to false', () => {
        service.isActionPopped = true;
        service.isPoppedActionResize = true;
        service.actions.push(new ActionResize(1, 1));
        service.undoAction();
        expect(service.isActionPopped).toBe(false);
        expect(service.isPoppedActionResize).toBe(false);
        expect(nextSpy).toHaveBeenCalled();
    });

    it('undoAction should call resizeActions.pop and removedAction.push() if poppedAction equals last actionResize of resizeActions array', () => {
        const actionResize = new ActionResize(1, 1);
        service.actions.push(actionResize);
        service.resizeActions.push(actionResize);
        service.undoAction();
        expect(service.resizeActions.length).toEqual(1);
        expect(service.removedActions.length).toEqual(1);
    });

    it('undoAction should call removedAction.pop if poppedAction is of type ActionRectangleSelection or ActionEllipseSelection and its imageMoveSelect property is undefined', () => {
        const strokeThickness = 0.5;
        const attributes = new ShapeAttribute(strokeThickness, DrawType.Outline);
        const primaryColor = 'black';
        const secondaryColor = 'black';
        const mouseDownCoord = { x: 35, y: 35 };

        const rectangle = new Rectangle(mouseDownCoord, attributes, primaryColor, secondaryColor);
        rectangle.width = 5;
        rectangle.height = 5;
        const actionRectangleSelection = new ActionRectangleSelection(rectangle.x, rectangle.y, rectangle.width, rectangle.height);

        service.actions.push(actionRectangleSelection);
        service.undoAction();
        expect(service.removedActions.length).toEqual(0);
    });

    it('redoAction should add an element to the actions array', () => {
        service.removedActions.push(new ActionResize(1, 1));
        service.redoAction();
        expect(service.actions.length).toEqual(2);
        expect(service.resizeActions.length).toEqual(2);
    });
});
