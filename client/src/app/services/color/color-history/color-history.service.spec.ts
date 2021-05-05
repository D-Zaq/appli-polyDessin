import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { ColorPickerService } from '@app/services/color/color-picker/color-picker.service';
import { ColorHistoryService } from './color-history.service';

describe('ColorHistoryService', () => {
    // tslint:disable: no-any //reason: tests

    let service: ColorHistoryService;
    let colorPickerServiceSpy: jasmine.SpyObj<ColorPickerService>;
    let canvasTestHelper: CanvasTestHelper;

    let canvasStub: HTMLCanvasElement;
    let drawCircleSpy: jasmine.Spy<any>;
    let isPointInCircleSpy: jasmine.Spy<any>;

    beforeEach(() => {
        colorPickerServiceSpy = jasmine.createSpyObj('ColorPickerService', ['setColor']);
        TestBed.configureTestingModule({
            providers: [{ provide: ColorPickerService, useValue: colorPickerServiceSpy }],
        });
        service = TestBed.inject(ColorHistoryService);
        canvasTestHelper = TestBed.inject(CanvasTestHelper);
        canvasStub = canvasTestHelper.canvas;
        drawCircleSpy = spyOn<any>(service, 'drawCircle').and.callThrough();
        isPointInCircleSpy = spyOn<any>(service, 'isPointInCircle').and.callThrough();
        service.canvas = canvasStub;
        service.ctx = canvasStub.getContext('2d') as CanvasRenderingContext2D;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('onInit should initialize the ctx, canvas and circleColors', () => {
        service.onInit(canvasStub);
        expect(service.ctx).not.toBeUndefined();
        expect(service.canvas).not.toBeUndefined();
        expect(service.circleColors).not.toBeUndefined();
    });

    it('drawColorHistory should populate circleColors', () => {
        colorPickerServiceSpy.colors = ['#000000', '#000000'];
        service.onInit(canvasStub);
        service.drawColorHistory();
        expect(service.circleColors.length).toEqual(2);
    });

    it('drawColorHistory should call drawCircle', () => {
        colorPickerServiceSpy.colors = ['#000000', '#000000'];
        service.onInit(canvasStub);
        service.drawColorHistory();
        expect(drawCircleSpy).toHaveBeenCalled();
    });

    it(' drawCircle hould not change the state of the context', () => {
        service.onInit(canvasStub);
        const previousCtx = service.ctx;
        const xPos = 5;
        const yPos = 5;
        const radiusSize = 5;
        const color = '#000000';
        const circleColor = { x: xPos, y: yPos, radius: radiusSize, color };

        service.drawCircle(circleColor);
        expect(service.ctx).toEqual(previousCtx);
    });

    it('onClick should call isPointInCircle and setColor with left', () => {
        service.onInit(canvasStub);

        const x = 5;
        const y = 6;
        const typeClick = 'left';

        const xPos = 5;
        const yPos = 5;
        const radiusSize = 5;
        const color = '#000000';
        const circleColor = { x: xPos, y: yPos, radius: radiusSize, color };
        service.circleColors.push(circleColor);
        service.onClick(x, y, typeClick);
        expect(isPointInCircleSpy).toHaveBeenCalled();
    });

    it('onClick should call isPointInCircle and setColor with right', () => {
        service.onInit(canvasStub);

        const x = 5;
        const y = 6;
        const typeClick = 'right';

        const xPos = 5;
        const yPos = 5;
        const radiusSize = 5;
        const color = '#000000';
        const circleColor = { x: xPos, y: yPos, radius: radiusSize, color };
        service.circleColors.push(circleColor);
        service.onClick(x, y, typeClick);
        expect(isPointInCircleSpy).toHaveBeenCalled();
    });
});
