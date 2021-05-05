import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { BoundingBox } from '@app/classes/selections/bounding-box/bounding-box';
import { RectangleSelection } from '@app/classes/selections/rectangle-selection/rectangle-selection';
import { Rectangle } from '@app/classes/shapes/rectangle/rectangle';
import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { DrawType } from '@app/constants/draw-type';
import { Handle } from '@app/constants/handle';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { MagnetismService } from '@app/services/magnetism/magnetism.service';

describe('MagnetismService', () => {
    // tslint:disable: no-string-literal
    // tslint:disable: no-any
    // tslint:disable: no-magic-numbers
    // reason: Tests (the same reason applies to other tslints in the file)
    let service: MagnetismService;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let previewCtxStub: CanvasRenderingContext2D;
    let canvasStub: HTMLCanvasElement;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;
    let boundingBoxSpy: jasmine.SpyObj<BoundingBox>;
    let strokeThickness: number;
    let attributes: ShapeAttribute;
    let primaryColor: string;
    let secondaryColor: string;
    let selectionSpy: jasmine.SpyObj<RectangleSelection>;
    let rectangleSelection: RectangleSelection;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas']);
        selectionSpy = jasmine.createSpyObj('RectangleSelection', ['draw']);
        boundingBoxSpy = jasmine.createSpyObj('BoundingBox', ['updateControlPoints', 'createControlPoints', 'draw']);
        TestBed.configureTestingModule({
            providers: [
                { provide: DrawingService, useValue: drawServiceSpy },
                { provide: RectangleSelection, useValue: selectionSpy },
                { provide: BoundingBox, useValue: boundingBoxSpy },
            ],
        });
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.canvas.getContext('2d') as CanvasRenderingContext2D;
        previewCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;
        canvasStub = canvasTestHelper.canvas;

        service = TestBed.inject(MagnetismService);
        service['drawingService'] = drawServiceSpy;
        service['drawingService'].baseCtx = baseCtxStub; // Jasmine doesnt copy properties with underlying data
        service['drawingService'].previewCtx = previewCtxStub;
        service['drawingService'].canvas = canvasStub;
        service['drawingService'].gridSquareSize = 12;
        strokeThickness = 0.5;
        attributes = new ShapeAttribute(strokeThickness, DrawType.Outline);
        primaryColor = 'black';
        secondaryColor = 'black';
        const mousePosition = { x: 0, y: 0 };
        rectangleSelection = new RectangleSelection(mousePosition, attributes, primaryColor, secondaryColor);
        rectangleSelection = selectionSpy;
        rectangleSelection.boundingBox = boundingBoxSpy;
        rectangleSelection.boundingBox.rectangle = new Rectangle(mousePosition, attributes, primaryColor, secondaryColor);
        rectangleSelection.boundingBox.createControlPoints();
        rectangleSelection.boundingBox.rectangle.x = 10;
        rectangleSelection.boundingBox.rectangle.y = 10;
        rectangleSelection.boundingBox.rectangle.width = 5;
        rectangleSelection.boundingBox.rectangle.height = 5;

        service['snapPosition'] = { x: 0, y: 0 };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('setSnapPosition should properly modify snapPosition if selectedControlPoint is top left', () => {
        service.selectedControlPoint = Handle.TopLeft;
        service.setSnapPosition(rectangleSelection);
        expect(service['snapPosition'].x).toEqual(10);
        expect(service['snapPosition'].y).toEqual(10);
    });

    it('setSnapPosition should properly modify snapPosition if selectedControlPoint is top right', () => {
        service.selectedControlPoint = Handle.TopRight;
        service.setSnapPosition(rectangleSelection);
        expect(service['snapPosition'].x).toEqual(15);
        expect(service['snapPosition'].y).toEqual(10);
    });

    it('setSnapPosition should properly modify snapPosition if selectedControlPoint is bottom left', () => {
        service.selectedControlPoint = Handle.BottomLeft;
        service.setSnapPosition(rectangleSelection);
        expect(service['snapPosition'].x).toEqual(10);
        expect(service['snapPosition'].y).toEqual(15);
    });

    it('setSnapPosition should properly modify snapPosition if selectedControlPoint is bottom right', () => {
        service.selectedControlPoint = Handle.BottomRight;
        service.setSnapPosition(rectangleSelection);
        expect(service['snapPosition'].x).toEqual(15);
        expect(service['snapPosition'].y).toEqual(15);
    });
    it('setSnapPosition should properly modify snapPosition if selectedControlPoint is top', () => {
        service.selectedControlPoint = Handle.Top;
        service.setSnapPosition(rectangleSelection);
        expect(service['snapPosition'].x).toEqual(12.5);
        expect(service['snapPosition'].y).toEqual(10);
    });

    it('setSnapPosition should properly modify snapPosition if selectedControlPoint is left', () => {
        service.selectedControlPoint = Handle.Left;
        service.setSnapPosition(rectangleSelection);
        expect(service['snapPosition'].x).toEqual(10);
        expect(service['snapPosition'].y).toEqual(12.5);
    });

    it('setSnapPosition should properly modify snapPosition if selectedControlPoint is right', () => {
        service.selectedControlPoint = Handle.Right;
        service.setSnapPosition(rectangleSelection);

        expect(service['snapPosition'].x).toEqual(15);
        expect(service['snapPosition'].y).toEqual(12.5);
    });

    it('setSnapPosition should properly modify snapPosition if selectedControlPoint is bottom', () => {
        service.selectedControlPoint = Handle.Bottom;
        service.setSnapPosition(rectangleSelection);
        expect(service['snapPosition'].x).toEqual(12.5);
        expect(service['snapPosition'].y).toEqual(15);
    });

    it('setSnapPosition should properly modify snapPosition if selectedControlPoint is center box', () => {
        service.selectedControlPoint = Handle.CenterBox;
        service.setSnapPosition(rectangleSelection);
        expect(service['snapPosition'].x).toEqual(12.5);
        expect(service['snapPosition'].y).toEqual(12.5);
    });

    it('snapSelectionToGrid should call clearCanvas, updateControlPoint, draw', () => {
        service.snapSelectionToGrid(rectangleSelection, 1, 1);

        expect(drawServiceSpy.clearCanvas).toHaveBeenCalledWith(previewCtxStub);
        expect(boundingBoxSpy.updateControlPoints).toHaveBeenCalled();
        expect(selectionSpy.draw).toHaveBeenCalled();
    });

    it('snapSelectionToGrid should properly modify x/y if selectedControlPoint is top left', () => {
        service.selectedControlPoint = Handle.TopLeft;
        service.snapSelectionToGrid(rectangleSelection, 5, 5);
        expect(rectangleSelection.boundingBox.rectangle.x).toEqual(0);
        expect(rectangleSelection.boundingBox.rectangle.y).toEqual(0);
    });

    it('snapSelectionToGrid should properly modify x/y if selectedControlPoint is top right', () => {
        service.selectedControlPoint = Handle.TopRight;
        service.snapSelectionToGrid(rectangleSelection, 5, 5);
        expect(rectangleSelection.boundingBox.rectangle.x).toEqual(-5);
        expect(rectangleSelection.boundingBox.rectangle.y).toEqual(0);
    });

    it('snapSelectionToGrid should properly modify x/y if selectedControlPoint is bottom left', () => {
        service.selectedControlPoint = Handle.BottomLeft;
        service.snapSelectionToGrid(rectangleSelection, 5, 5);
        expect(rectangleSelection.boundingBox.rectangle.x).toEqual(0);
        expect(rectangleSelection.boundingBox.rectangle.y).toEqual(-5);
    });

    it('snapSelectionToGrid should properly modify x/y if selectedControlPoint is bottom right', () => {
        service.selectedControlPoint = Handle.BottomRight;
        service.snapSelectionToGrid(rectangleSelection, 5, 5);
        expect(rectangleSelection.boundingBox.rectangle.x).toEqual(-5);
        expect(rectangleSelection.boundingBox.rectangle.y).toEqual(-5);
    });

    it('snapSelectionToGrid should properly modify x/y if selectedControlPoint is top', () => {
        service.selectedControlPoint = Handle.Top;
        service.snapSelectionToGrid(rectangleSelection, 5, 5);
        expect(rectangleSelection.boundingBox.rectangle.x).toEqual(-2.5);
        expect(rectangleSelection.boundingBox.rectangle.y).toEqual(0);
    });

    it('snapSelectionToGrid should properly modify x/y if selectedControlPoint is left', () => {
        service.selectedControlPoint = Handle.Left;
        service.snapSelectionToGrid(rectangleSelection, 5, 5);
        expect(rectangleSelection.boundingBox.rectangle.x).toEqual(0);
        expect(rectangleSelection.boundingBox.rectangle.y).toEqual(-2.5);
    });

    it('snapSelectionToGrid should properly modify x/y if selectedControlPoint is bottom', () => {
        service.selectedControlPoint = Handle.Bottom;
        service.snapSelectionToGrid(rectangleSelection, 5, 5);
        expect(rectangleSelection.boundingBox.rectangle.x).toEqual(-2.5);
        expect(rectangleSelection.boundingBox.rectangle.y).toEqual(-5);
    });

    it('snapSelectionToGrid should properly modify x/y if selectedControlPoint is right', () => {
        service.selectedControlPoint = Handle.Right;
        service.snapSelectionToGrid(rectangleSelection, 5, 5);
        expect(rectangleSelection.boundingBox.rectangle.x).toEqual(-5);
        expect(rectangleSelection.boundingBox.rectangle.y).toEqual(-2.5);
    });

    it('snapSelectionToGrid should properly modify x/y if selectedControlPoint is centerBox', () => {
        service.selectedControlPoint = Handle.CenterBox;
        service.snapSelectionToGrid(rectangleSelection, 5, 5);
        expect(rectangleSelection.boundingBox.rectangle.x).toEqual(-2.5);
        expect(rectangleSelection.boundingBox.rectangle.y).toEqual(-2.5);
    });
});
