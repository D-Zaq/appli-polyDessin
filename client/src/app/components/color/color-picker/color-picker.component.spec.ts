import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorHistoryService } from '@app/services/color/color-history/color-history.service';
import { ColorPickerService } from '@app/services/color/color-picker/color-picker.service';
import { ColorPickerModule } from '@syncfusion/ej2-angular-inputs';
import { ColorPickComponent } from './color-picker.component';

describe('ColorPickComponent', () => {
    let component: ColorPickComponent;
    let fixture: ComponentFixture<ColorPickComponent>;
    let colorPickerServiceSpy: jasmine.SpyObj<ColorPickerService>;
    let colorHistoryServiceSpy: jasmine.SpyObj<ColorHistoryService>;

    beforeEach(async(() => {
        colorPickerServiceSpy = jasmine.createSpyObj('ColorPickerService', ['addColor', 'invertColors']);
        colorHistoryServiceSpy = jasmine.createSpyObj('ColorHistoryService', ['drawColorHistory']);

        TestBed.configureTestingModule({
            declarations: [ColorPickComponent],
            providers: [
                { provide: ColorPickerService, useValue: colorPickerServiceSpy },
                { provide: ColorHistoryService, useValue: colorHistoryServiceSpy },
            ],
            imports: [ColorPickerModule],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorPickComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        component.isOnChange = true;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('primaryColor input should not call colorPickerService.addColor when isOnChange is false', async(() => {
        component.isOnChange = false;
        expect(colorPickerServiceSpy.addColor).not.toHaveBeenCalled();
        expect(colorHistoryServiceSpy.drawColorHistory).not.toHaveBeenCalled();
    }));

    it('secondaryColor input should not call colorPickerService.addColor when isOnChange is false', async(() => {
        component.isOnChange = false;
        expect(colorPickerServiceSpy.addColor).not.toHaveBeenCalled();
        expect(colorHistoryServiceSpy.drawColorHistory).not.toHaveBeenCalled();
    }));

    it('primaryColor getter should return colorPickerService.primaryColor', async(() => {
        const primaryColor = component.primaryColor;
        expect(primaryColor).not.toBeNull();
    }));

    it('secondaryColor getter should return colorPickerService.secondaryColor', async(() => {
        const secondaryColor = component.secondaryColor;
        expect(secondaryColor).not.toBeNull();
    }));

    it('isOnChange should set isOnChange to true', () => {
        component.onChange();
        expect(component.isOnChange).toEqual(true);
    });

    it('onClick should call colorPickerService.invertColors', () => {
        component.onClick();
        expect(colorPickerServiceSpy.invertColors).toHaveBeenCalled();
    });
});
