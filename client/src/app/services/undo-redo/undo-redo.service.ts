import { Injectable } from '@angular/core';
import { ActionResize } from '@app/classes/action-object//action-resize/action-resize';
import { ActionEllipseSelection } from '@app/classes/action-object/action-ellipse-selection/action-ellipse-selection';
import { ActionLassoSelection } from '@app/classes/action-object/action-lasso-polygonal-selection/action-lasso-polygonal-selection';
import { ActionObject } from '@app/classes/action-object/action-object';
import { ActionRectangleSelection } from '@app/classes/action-object/action-rectangle-selection/action-rectangle-selection';
import { SIDE_BAR_WIDTH } from '@app/constants/constants';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class UndoRedoService {
    actions: ActionObject[];
    resizeActions: ActionResize[];

    removedActions: ActionObject[];

    content: BehaviorSubject<ActionObject[]>;
    share: Observable<ActionObject[]>;

    isActionPopped: boolean;

    isPoppedActionResize: boolean;

    constructor() {
        this.actions = [];
        this.removedActions = [];
        this.resizeActions = [];

        this.content = new BehaviorSubject<ActionObject[]>(this.actions);
        this.share = this.content.asObservable();

        this.isActionPopped = false;
        this.isPoppedActionResize = false;

        const firstResize = new ActionResize((window.innerWidth - SIDE_BAR_WIDTH) / 2, window.innerHeight / 2);
        this.actions.push(firstResize);
        this.resizeActions.push(firstResize);
    }

    setFirstResizeDimensions(newWidth: number, newHeight: number): void {
        this.resizeActions[0].canvasWidth = newWidth;
        this.resizeActions[0].canvasHeight = newHeight;
    }

    addAction(actionObject: ActionObject): void {
        this.actions.push(actionObject);
        this.removedActions = [];
        if (actionObject instanceof ActionResize) {
            this.resizeActions.push(actionObject);
        }

        this.content.next(this.actions);
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.ctrlKey && (event.key === 'z' || event.key === 'Z')) {
            if (!event.shiftKey) {
                this.undoAction();
            } else {
                this.redoAction();
            }
        }
    }

    undoAction(): void {
        this.isActionPopped = true;
        let poppedAction: ActionObject | undefined;

        if (this.actions.length > 1) {
            poppedAction = this.actions.pop();
            if (poppedAction != undefined) {
                if (poppedAction === this.resizeActions[this.resizeActions.length - 1]) {
                    this.resizeActions.pop();
                    this.isPoppedActionResize = true;
                }
                this.removedActions.push(poppedAction);
                if (
                    (poppedAction instanceof ActionRectangleSelection ||
                        poppedAction instanceof ActionEllipseSelection ||
                        poppedAction instanceof ActionLassoSelection) &&
                    poppedAction.getImageMoveSelect() == undefined
                ) {
                    this.removedActions.pop();
                }
                this.content.next(this.actions);
            }
        }
        this.isActionPopped = false;
        this.isPoppedActionResize = false;
    }

    redoAction(): void {
        const action: ActionObject | undefined = this.removedActions.pop();
        if (action != undefined) {
            this.actions.push(action);
            if (action instanceof ActionResize) this.resizeActions.push(action);
            this.content.next(this.actions);
        }
    }
}
