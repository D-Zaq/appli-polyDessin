import { TestBed } from '@angular/core/testing';
import { ActionShape } from '@app/classes/action-object/action-shape/action-shape';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { Rectangle } from '@app/classes/shapes/rectangle/rectangle';
import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { DrawType } from '@app/constants/draw-type';
import { DrawingService } from '@app/services/drawing/drawing.service';

describe('ActionShape', () => {
    // tslint:disable: no-string-literal
    // tslint:disable: no-any
    // tslint:disable: no-magic-numbers
    // reason: Tests (the same reason applies to other tslints in the file)
    let actionShape: ActionShape;
    let canvasTestHelper: CanvasTestHelper;
    let baseCtxStub: CanvasRenderingContext2D;
    let strokeThickness: number;
    let attributes: ShapeAttribute;
    let primaryColor: string;
    let secondaryColor: string;
    let rectangle: Rectangle;
    let drawServiceSpy: jasmine.SpyObj<DrawingService>;

    beforeEach(() => {
        drawServiceSpy = jasmine.createSpyObj('DrawingService', ['clearCanvas', 'getPrimaryColor', 'getSecondaryColor']);

        TestBed.configureTestingModule({
            providers: [{ provides: 'DrawingService', useValue: drawServiceSpy }],
        });

        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        baseCtxStub = canvasTestHelper.drawCanvas.getContext('2d') as CanvasRenderingContext2D;

        strokeThickness = 0.5;
        attributes = new ShapeAttribute(strokeThickness, DrawType.Outline);
        primaryColor = 'black';
        secondaryColor = 'black';
        const mouseDownCoord = { x: 35, y: 35 };
        drawServiceSpy.baseCtx = baseCtxStub;

        rectangle = new Rectangle(mouseDownCoord, attributes, primaryColor, secondaryColor);
        rectangle.width = 5;
        rectangle.height = 5;
        actionShape = new ActionShape(rectangle);
    });

    it('should be created', () => {
        expect(actionShape).toBeTruthy();
    });

    it('execute should call shape.draw', () => {
        const drawSpy = spyOn<any>(actionShape.shape, 'draw').and.callThrough();

        actionShape.execute(drawServiceSpy);

        expect(drawSpy).toHaveBeenCalledWith(drawServiceSpy.baseCtx);
    });
});
