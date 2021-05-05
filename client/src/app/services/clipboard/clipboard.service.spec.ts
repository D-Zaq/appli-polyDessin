import { TestBed } from '@angular/core/testing';
import { RectangleSelection } from '@app/classes/selections/rectangle-selection/rectangle-selection';
import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { DrawType } from '@app/constants/draw-type';
import { SelectionService } from '@app/services/selection/selection.service';
import { ClipboardService } from './clipboard.service';

describe('ClipboardService', () => {
    // tslint:disable: no-string-literal
    // tslint:disable: no-any
    // tslint:disable: no-magic-numbers
    // reason: Tests (the same reason applies to other tslints in the file)
    let service: ClipboardService;
    let selectionServiceSpy: jasmine.SpyObj<SelectionService>;
    let selectionSpy: jasmine.SpyObj<RectangleSelection>;
    let copySpy: jasmine.Spy<any>;
    let pasteSpy: jasmine.Spy<any>;
    let deleteSpy: jasmine.Spy<any>;
    let cutSpy: jasmine.Spy<any>;
    let strokeThickness: number;
    let attributes: ShapeAttribute;
    let primaryColor: string;
    let secondaryColor: string;
    let rectangleSelection: RectangleSelection;

    let keyDownEvent: KeyboardEvent;

    beforeEach(() => {
        selectionServiceSpy = jasmine.createSpyObj('SelectionService', [
            'getIsSelected',
            'onMouseDown',
            'onInit',
            'setCurrentMousePosition',
            'onMouseUp',
            'setIsDragging',
            'setIsSelected',
            'isSelected',
            'selection',
        ]);
        selectionSpy = jasmine.createSpyObj('RectangleSelection', ['updateDimensionsMove']);
        TestBed.configureTestingModule({
            providers: [
                { provide: SelectionService, useValue: selectionServiceSpy },
                { provide: RectangleSelection, useValue: selectionSpy },
            ],
        });

        service = TestBed.inject(ClipboardService);
        copySpy = spyOn<any>(service, 'copy').and.callThrough();
        pasteSpy = spyOn<any>(service, 'paste').and.callThrough();
        deleteSpy = spyOn<any>(service, 'delete').and.callThrough();
        cutSpy = spyOn<any>(service, 'cut').and.callThrough();

        strokeThickness = 0.5;
        attributes = new ShapeAttribute(strokeThickness, DrawType.Outline);
        primaryColor = 'black';
        secondaryColor = 'black';
        const mousePosition = { x: 0, y: 0 };
        rectangleSelection = new RectangleSelection(mousePosition, attributes, primaryColor, secondaryColor);

        service['selectionService'] = selectionServiceSpy;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('onKeyDown should call delete if delete key is pressed', () => {
        keyDownEvent = new KeyboardEvent('keydown', { key: 'Delete' });
        service.onKeyDown(keyDownEvent);
        expect(deleteSpy).toHaveBeenCalled();
    });

    it('onKeyDown should not call copy/paste/cut if ctrl key is not pressed', () => {
        keyDownEvent = new KeyboardEvent('keydown', { ctrlKey: false });
        service.onKeyDown(keyDownEvent);
        expect(copySpy).not.toHaveBeenCalled();
        expect(cutSpy).not.toHaveBeenCalled();
        expect(pasteSpy).not.toHaveBeenCalled();
    });

    it('onKeyDown should call copy if ctrl + c is pressed', () => {
        keyDownEvent = new KeyboardEvent('keydown', { key: 'c', ctrlKey: true });
        service.onKeyDown(keyDownEvent);
        expect(copySpy).toHaveBeenCalled();
    });

    it('onKeyDown should call cut if ctrl + x  is pressed', () => {
        keyDownEvent = new KeyboardEvent('keydown', { key: 'x', ctrlKey: true });
        service.onKeyDown(keyDownEvent);
        expect(cutSpy).toHaveBeenCalled();
    });

    it('onKeyDown should call paste if ctrl + c is pressed', () => {
        keyDownEvent = new KeyboardEvent('keydown', { key: 'v', ctrlKey: true });
        service.onKeyDown(keyDownEvent);
        expect(pasteSpy).toHaveBeenCalled();
    });

    it('applyAction should call delete if action is Delete', () => {
        const action = 'Delete';
        service.applyAction(action);
        expect(deleteSpy).toHaveBeenCalled();
    });

    it('applyAction should call cut if action is Cut', () => {
        const action = 'Cut';
        service.applyAction(action);
        expect(cutSpy).toHaveBeenCalled();
    });

    it('applyAction should call copy if action is Copy', () => {
        const action = 'Copy';
        service.applyAction(action);
        expect(copySpy).toHaveBeenCalled();
    });

    it('applyAction should call paste if action is Paste', () => {
        const action = 'Paste';
        service.applyAction(action);
        expect(pasteSpy).toHaveBeenCalled();
    });

    it('cut should modify selection property if selectionService.isSelected is true', () => {
        service['selectionService']['isSelected'] = true;
        service['selectionService'].selection = rectangleSelection;
        service.cut();
        expect(service.selection).toBeDefined();
        expect(selectionServiceSpy.onInit).toHaveBeenCalled();
    });

    it('cut should not modify selection property if selectionService.isSelected is false', () => {
        service['selectionService']['isSelected'] = false;
        service.cut();
        expect(service.selection).not.toBeDefined();
        expect(selectionServiceSpy.onInit).not.toHaveBeenCalled();
    });
    it('delete should call selectionService.onInit if selectionService.isSelected is true', () => {
        service['selectionService']['isSelected'] = true;
        service.delete();
        expect(selectionServiceSpy.onInit).toHaveBeenCalled();
    });

    it('delete should not call selectionService.onInit if selectionService.isSelected is false', () => {
        service['selectionService']['isSelected'] = false;
        service.delete();
        expect(selectionServiceSpy.onInit).not.toHaveBeenCalled();
    });

    it('copy should modify selection property if selectionService.isSelected is true', () => {
        service['selectionService']['isSelected'] = true;
        service['selectionService']['selection'] = rectangleSelection;
        service.copy();
        expect(service['selection']).toBeDefined();
    });

    it('copy should not modify selection property if selectionService.isSelected is false', () => {
        service['selectionService']['isSelected'] = false;
        service.copy();
        expect(service['selection']).not.toBeDefined();
    });

    it('paste should call selectionService.onMouseUp if selection property is defined', () => {
        service['selectionService'].selection = selectionSpy;
        service.selection = rectangleSelection;
        service.paste();
        expect(service['selectionService'].selection).toBeDefined();
        expect(service['selectionService'].mouseDown).toBe(true);

        expect(selectionServiceSpy.onMouseUp).toHaveBeenCalled();
        expect(selectionServiceSpy.setIsDragging).toHaveBeenCalledWith(true);
        expect(selectionServiceSpy.setCurrentMousePosition).toHaveBeenCalledWith({ x: -1, y: -1 });
    });

    it('paste should call selectionService.onMouseDown if selection property is defined and selectionService.isSelected is true', () => {
        service.selection = rectangleSelection;
        service['selectionService']['isSelected'] = true;

        service.paste();
        expect(service['selectionService'].mouseDown).toBe(true);
        expect(selectionServiceSpy.onMouseDown).toHaveBeenCalled();
        expect(selectionServiceSpy.onInit).toHaveBeenCalled();
    });

    it('paste should not call selectionService.onMouseDown if selection property is defined and selectionService.isSelected is false', () => {
        service.selection = rectangleSelection;
        service['selectionService']['isSelected'] = false;

        service.paste();
        expect(selectionServiceSpy.onMouseDown).not.toHaveBeenCalled();
        expect(selectionServiceSpy.onInit).not.toHaveBeenCalled();
    });
});
