import { TestBed } from '@angular/core/testing';
import { Rectangle } from '@app/classes/shapes/rectangle/rectangle';
import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { DrawType } from '@app/constants/draw-type';
import { Handle } from '@app/constants/handle';
import { BoundingBox } from './bounding-box';

describe('BoundingBox', () => {
    // tslint:disable: no-string-literal
    // tslint:disable: no-any
    // tslint:disable: no-magic-numbers
    // reason: Tests (the same reason applies to other tslints in the file)
    let boundingBox: BoundingBox;
    let strokeThickness: number;
    let attributes: ShapeAttribute;
    let primaryColor: string;
    let secondaryColor: string;

    let updateControlPointsSpy: jasmine.Spy<any>;
    let rectangleSpy: jasmine.SpyObj<Rectangle>;
    beforeEach(() => {
        rectangleSpy = jasmine.createSpyObj('Rectangle', ['draw', 'contains', 'updateDimensions']);
        TestBed.configureTestingModule({
            providers: [{ provide: Rectangle, useValue: rectangleSpy }],
        });
        strokeThickness = 0.5;
        attributes = new ShapeAttribute(strokeThickness, DrawType.Outline);
        primaryColor = 'black';
        secondaryColor = 'black';
        const mouseDownCoord = { x: 0, y: 0 };
        boundingBox = new BoundingBox(mouseDownCoord, attributes, primaryColor, secondaryColor);
        updateControlPointsSpy = spyOn<any>(boundingBox, 'updateControlPoints').and.callThrough();

        boundingBox.rectangle = rectangleSpy;
    });

    it('should be created', () => {
        expect(boundingBox).toBeTruthy();
    });

    it('createControlPoints should populate the controlPoints array', () => {
        const SIZE_LIMIT = 8;
        boundingBox.createControlPoints();
        expect(boundingBox.controlPoints.length).toEqual(SIZE_LIMIT);
        for (let i = 0; i < SIZE_LIMIT; i++) {
            expect(boundingBox.controlPoints[i]).toEqual({ x: 0, y: 0, sideLength: 9, handle: Object.values(Handle)[i] });
        }
    });

    it('updateDimensions should call rectangle.updateDimensions and updateControlPoints', () => {
        const mousePosition = { x: 25, y: 25 };
        const isShiftPressed = true;
        boundingBox.updateDimensions(mousePosition, isShiftPressed);
        expect(rectangleSpy.updateDimensions).toHaveBeenCalled();
        expect(updateControlPointsSpy).toHaveBeenCalled();
    });

    it('contains should call rectangle.contains', () => {
        const mousePosition = { x: 25, y: 25 };
        boundingBox.contains(mousePosition);
        expect(rectangleSpy.contains).toHaveBeenCalled();
    });

    it('updateControlPoints should modify every controlPoints of the controlPoints array', () => {
        const mouseDownCoord = { x: 75, y: 75 };
        boundingBox.rectangle = new Rectangle(mouseDownCoord, attributes, primaryColor, secondaryColor);
        const mousePosition = { x: 25, y: 25 };
        boundingBox.rectangle.updateDimensions(mousePosition);
        boundingBox.updateControlPoints();
        const SIZE_LIMIT = 8;
        for (let i = 0; i < SIZE_LIMIT; i++) {
            expect(boundingBox.controlPoints[i]).not.toEqual({ x: 0, y: 0, sideLength: 9, handle: Object.values(Handle)[i] });
        }
    });
});
