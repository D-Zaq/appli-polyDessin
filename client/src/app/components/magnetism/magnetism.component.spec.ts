import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Handle } from '@app/constants/handle';
import { MagnetismService } from '@app/services/magnetism/magnetism.service';
import { MagnetismComponent } from './magnetism.component';

describe('MagnetismComponent', () => {
    let component: MagnetismComponent;
    let fixture: ComponentFixture<MagnetismComponent>;
    let magnetismServiceSpy: jasmine.SpyObj<MagnetismService>;
    beforeEach(async(() => {
        magnetismServiceSpy = jasmine.createSpyObj('MagnetismService', ['selectedControlPoint']);
        TestBed.configureTestingModule({
            declarations: [MagnetismComponent],
            providers: [{ provide: MagnetismService, useValue: magnetismServiceSpy }],
        }).compileComponents();

        magnetismServiceSpy = TestBed.inject(MagnetismService) as jasmine.SpyObj<MagnetismService>;
        magnetismServiceSpy.selectedControlPoint = Handle.TopLeft;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(MagnetismComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('selectControlPointRadio should set isTopLeft to true if magnetismService.selectedControlPoint is top left', () => {
        magnetismServiceSpy.selectedControlPoint = Handle.TopLeft;
        component.selectControlPointRadio();
        expect(component.isTopLeft).toBe(true);
    });

    it('selectControlPointRadio should set isTopRight to true if magnetismService.selectedControlPoint is top right', () => {
        magnetismServiceSpy.selectedControlPoint = Handle.TopRight;
        component.selectControlPointRadio();
        expect(component.isTopRight).toBe(true);
    });

    it('selectControlPointRadio should set isTop to true if magnetismService.selectedControlPoint is top', () => {
        magnetismServiceSpy.selectedControlPoint = Handle.Top;
        component.selectControlPointRadio();
        expect(component.isTop).toBe(true);
    });

    it('selectControlPointRadio should set isLeft to true if magnetismService.selectedControlPoint is left', () => {
        magnetismServiceSpy.selectedControlPoint = Handle.Left;
        component.selectControlPointRadio();
        expect(component.isLeft).toBe(true);
    });

    it('selectControlPointRadio should set isRight to true if magnetismService.selectedControlPoint is right', () => {
        magnetismServiceSpy.selectedControlPoint = Handle.Right;
        component.selectControlPointRadio();
        expect(component.isRight).toBe(true);
    });
    it('selectControlPointRadio should set isBottom to true if magnetismService.selectedControlPoint is bottom', () => {
        magnetismServiceSpy.selectedControlPoint = Handle.Bottom;
        component.selectControlPointRadio();
        expect(component.isBottom).toBe(true);
    });
    it('selectControlPointRadio should set isBottomLeft to true if magnetismService.selectedControlPoint is bottom left', () => {
        magnetismServiceSpy.selectedControlPoint = Handle.BottomLeft;
        component.selectControlPointRadio();
        expect(component.isBottomLeft).toBe(true);
    });

    it('selectControlPointRadio should set isBottomRight to true if magnetismService.selectedControlPoint is bottom right', () => {
        magnetismServiceSpy.selectedControlPoint = Handle.BottomRight;
        component.selectControlPointRadio();
        expect(component.isBottomRight).toBe(true);
    });

    it('selectControlPointRadio should set isCenterBox to true if magnetismService.selectedControlPoint is center box', () => {
        magnetismServiceSpy.selectedControlPoint = Handle.CenterBox;
        component.selectControlPointRadio();
        expect(component.isCenterBox).toBe(true);
    });

    it('radioControlPointHandler should set this.choiceControlPoint to Handle.TopLeft if event is 1', () => {
        const event = '1';
        component.radioControlPointHandler(event);
        expect(component.choiceControlPoint).toEqual(Handle.TopLeft);
        expect(magnetismServiceSpy.selectedControlPoint).toEqual(component.choiceControlPoint);
    });

    it('radioControlPointHandler should set this.choiceControlPoint to Handle.TopRight if event is 2', () => {
        const event = '2';
        component.radioControlPointHandler(event);
        expect(component.choiceControlPoint).toEqual(Handle.TopRight);
        expect(magnetismServiceSpy.selectedControlPoint).toEqual(component.choiceControlPoint);
    });

    it('radioControlPointHandler should set this.choiceControlPoint to Handle.BottomLeft if event is 3', () => {
        const event = '3';
        component.radioControlPointHandler(event);
        expect(component.choiceControlPoint).toEqual(Handle.BottomLeft);
        expect(magnetismServiceSpy.selectedControlPoint).toEqual(component.choiceControlPoint);
    });

    it('radioControlPointHandler should set this.choiceControlPoint to Handle.BottomRight if event is 4', () => {
        const event = '4';
        component.radioControlPointHandler(event);
        expect(component.choiceControlPoint).toEqual(Handle.BottomRight);
        expect(magnetismServiceSpy.selectedControlPoint).toEqual(component.choiceControlPoint);
    });

    it('radioControlPointHandler should set this.choiceControlPoint to Handle.Top if event is 5', () => {
        const event = '5';
        component.radioControlPointHandler(event);
        expect(component.choiceControlPoint).toEqual(Handle.Top);
        expect(magnetismServiceSpy.selectedControlPoint).toEqual(component.choiceControlPoint);
    });

    it('radioControlPointHandler should set this.choiceControlPoint to Handle.Left if event is 6', () => {
        const event = '6';
        component.radioControlPointHandler(event);
        expect(component.choiceControlPoint).toEqual(Handle.Left);
        expect(magnetismServiceSpy.selectedControlPoint).toEqual(component.choiceControlPoint);
    });

    it('radioControlPointHandler should set this.choiceControlPoint to Handle.Bottom if event is 7', () => {
        const event = '7';
        component.radioControlPointHandler(event);
        expect(component.choiceControlPoint).toEqual(Handle.Bottom);
        expect(magnetismServiceSpy.selectedControlPoint).toEqual(component.choiceControlPoint);
    });

    it('radioControlPointHandler should set this.choiceControlPoint to Handle.Right if event is 8', () => {
        const event = '8';
        component.radioControlPointHandler(event);
        expect(component.choiceControlPoint).toEqual(Handle.Right);
        expect(magnetismServiceSpy.selectedControlPoint).toEqual(component.choiceControlPoint);
    });

    it('radioControlPointHandler should set this.choiceControlPoint to Handle.CenterBox if event is 9', () => {
        const event = '9';
        component.radioControlPointHandler(event);
        expect(component.choiceControlPoint).toEqual(Handle.CenterBox);
        expect(magnetismServiceSpy.selectedControlPoint).toEqual(component.choiceControlPoint);
    });
});
