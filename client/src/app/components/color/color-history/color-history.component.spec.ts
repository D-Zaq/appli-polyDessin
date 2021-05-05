import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorHistoryService } from '@app/services/color/color-history/color-history.service';
import { ColorHistoryComponent } from './color-history.component';

describe('ColorHistoryComponent', () => {
    // tslint:disable: no-string-literal
    // tslint:disable: no-any
    // reason: Tests (the same reason applies to other tslints in the file)
    let component: ColorHistoryComponent;
    let fixture: ComponentFixture<ColorHistoryComponent>;
    let colorHistoryServiceSpy: jasmine.SpyObj<ColorHistoryService>;
    // tslint:disable-next-line: no-any // reason: Tests
    let addColorEventListenersSpy: jasmine.Spy<any>;

    beforeEach(async(() => {
        colorHistoryServiceSpy = jasmine.createSpyObj('ColorHistoryService', ['onInit', 'onClick']);
        TestBed.configureTestingModule({
            declarations: [ColorHistoryComponent],
            providers: [{ provide: ColorHistoryService, useValue: colorHistoryServiceSpy }],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(ColorHistoryComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();

        addColorEventListenersSpy = spyOn<any>(component, 'addColorEventListeners').and.callThrough();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngAfterViewInit should call colorHistoryService.onInit and addColorEventListeners', () => {
        component.ngAfterViewInit();
        expect(colorHistoryServiceSpy.onInit).toHaveBeenCalled();
        expect(addColorEventListenersSpy).toHaveBeenCalled();
    });

    it('addColorEventListeners should call elem.addEventListener ', () => {
        // tslint:disable-next-line: no-non-null-assertion // reason: elem can be null
        const elem = document.getElementById('canvas')!;
        const addEventListenerSpy = spyOn<any>(elem, 'addEventListener').and.callThrough();
        component.addColorEventListeners();
        expect(addEventListenerSpy).toHaveBeenCalled();
    });

    /*it('addColorEventListeners should call elem.addEventListener ', () => {
        // tslint:disable-next-line: no-non-null-assertion // reason: elem can be null
        const elem = document.getElementById('canvas')!;
        const mouseEventLClick = {
            offsetX: 25,
            offsetY: 25,
            button: MouseButton.Left,
        } as MouseEvent;

        elem.addEventListener('click', mouseEventLClick);
        expect(colorHistoryServiceSpy.onClick).toHaveBeenCalled();
    });*/
});
