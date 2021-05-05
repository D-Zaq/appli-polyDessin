import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSlider, MatSliderChange } from '@angular/material/slider';
import { GRID_MINIMUM_SIZE, MAX_OPACITY, MIN_OPACITY } from '@app/constants/constants';
import { MaterialModule } from '@app/material.module';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { GridComponent } from './grid.component';

describe('GridComponent', () => {
    let component: GridComponent;
    let fixture: ComponentFixture<GridComponent>;
    let drawingServiceSpy: jasmine.SpyObj<DrawingService>;
    // tslint:disable-next-line: prefer-const reason : test
    let matSliderSource: MatSlider;
    let matSliderEvent: MatSliderChange;

    beforeEach(async(() => {
        drawingServiceSpy = jasmine.createSpyObj('DrawingService', ['drawGrid']);
        TestBed.configureTestingModule({
            imports: [MaterialModule],
            declarations: [GridComponent],
            providers: [{ provide: DrawingService, useValue: drawingServiceSpy }],
        }).compileComponents();
        drawingServiceSpy = TestBed.inject(DrawingService) as jasmine.SpyObj<DrawingService>;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GridComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("drawGrid should change the grid state and call drawingService's drawGrid", () => {
        component.drawGrid();
        expect(drawingServiceSpy.drawGrid).toHaveBeenCalled();
        expect(drawingServiceSpy.isGrid).toEqual(true);
    });

    it("setGridSize should set drawingService's gridSquareSize to the slider event value when its not null", () => {
        matSliderEvent = { source: matSliderSource, value: GRID_MINIMUM_SIZE };
        component.setGridSize(matSliderEvent);
        expect(drawingServiceSpy.gridSquareSize).toEqual(GRID_MINIMUM_SIZE);
    });

    it("setGridSize should set drawingService's gridSquareSize to 0 when slider event value is null", () => {
        matSliderEvent = { source: matSliderSource, value: null };
        component.setGridSize(matSliderEvent);
        expect(drawingServiceSpy.gridSquareSize).toEqual(0);
    });

    it("setGridOpacity should call drawingService's drawGrid and set drawingService's gridLinesOpacity to the slider event value", () => {
        matSliderEvent = { source: matSliderSource, value: MIN_OPACITY };
        component.setGridOpacity(matSliderEvent);
        expect(drawingServiceSpy.gridLinesOpacity).toEqual(MIN_OPACITY);
        expect(drawingServiceSpy.drawGrid).toHaveBeenCalled();
    });

    it("setGridOpacity should not call drawingService's drawGrid and not set drawingService's gridLinesOpacity to the slider event value when its mull", () => {
        drawingServiceSpy.gridLinesOpacity = MAX_OPACITY;
        matSliderEvent = { source: matSliderSource, value: null };
        component.setGridOpacity(matSliderEvent);
        expect(drawingServiceSpy.gridLinesOpacity).toEqual(MAX_OPACITY);
        expect(drawingServiceSpy.drawGrid).not.toHaveBeenCalled();
    });
});
