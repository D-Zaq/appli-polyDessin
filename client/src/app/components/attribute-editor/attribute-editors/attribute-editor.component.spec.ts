import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AttributeEditorComponent } from './attribute-editor.component';

describe('AttributeEditorComponent', () => {
    let component: AttributeEditorComponent;
    let fixture: ComponentFixture<AttributeEditorComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AttributeEditorComponent],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AttributeEditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // it(' radioHandler should set this.choice to DrawType.Fill if event is 1', () => {
    //     const event = '1';
    //     component.choice = DrawType.Outline;
    //     component.radioHandler(event);
    //     expect(component).toEqual(DrawType.Fill);

    // });
    // it(' radioHandler should set this.choice to DrawType.Outline if event is 2', () => {
    //     const event = '1';
    //     component.choice = DrawType.Outline;
    //     component.radioHandler(event);
    //     expect(component).toEqual(DrawType.Fill);

    // });
    // it(' radioHandler should set this.choice to DrawType.OutlineFill if event is 3', () => {
    //     const event = '1';
    //     component.choice = DrawType.Outline;
    //     component.radioHandler(event);
    //     expect(component).toEqual(DrawType.Fill);

    // });
});
