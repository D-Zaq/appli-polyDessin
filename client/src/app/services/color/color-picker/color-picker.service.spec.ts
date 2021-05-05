import { TestBed } from '@angular/core/testing';
import { ColorPickerService } from './color-picker.service';

describe('ColorPickerService', () => {
    // tslint:disable: no-any //reason: tests (same reason for other tslints in this file)
    // tslint:disable: no-string-literal

    let service: ColorPickerService;

    let isSameColorAsPreviousSpy: jasmine.Spy<any>;
    let setColorSpy: jasmine.Spy<any>;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ColorPickerService);
        isSameColorAsPreviousSpy = spyOn<any>(service, 'isSameColorAsPrevious').and.callThrough();
        setColorSpy = spyOn<any>(service, 'setColor').and.callThrough();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('addColor should create a color array of size 1 if it is first color', () => {
        const color = '#000000';
        const type = 'primaryColor';
        service.addColor(color, type);
        expect(service.colors.length).toEqual(1);
    });

    it('addColor should call isSameColorAsPrevious if color array is not empty', () => {
        const color = '#000000';
        const type = 'primaryColor';
        service.colors = [color];
        service.addColor(color, type);
        expect(isSameColorAsPreviousSpy).toHaveBeenCalled();
    });

    it('addColor should unshift new color in the color array if isSameColorAsPrevious returns false', () => {
        const color = '#000000';
        const type = 'primaryColor';
        service.colors = [color];
        const anotherColor = '#838B8B';
        service.addColor(anotherColor, type);
        expect(service.colors.length).toEqual(2);
        expect(service.colors[0]).toEqual(anotherColor);
    });

    it('addColor should not unshift new color in the color array if isSameColorAsPrevious returns true', () => {
        const color = '#6e3a93ff';
        const type = 'primaryColor';
        service.colors = [color];
        const anotherColor = '#6e3a9370';
        service.addColor(anotherColor, type);
        expect(service.colors.length).toEqual(1);
        expect(service.colors[0]).toEqual(color);
    });

    it('addColor should pop the oldest color in the color array if its size is 10', () => {
        service.colors = [
            '#6e3a89ff',
            '#6e3a90ff',
            '#6e3a91ff',
            '#6e3a92ff',
            '#6e3a93ff',
            '#6e3a94ff',
            '#6e3a95ff',
            '#6e3a96ff',
            '#6e3a97ff',
            '#6e3a98ff',
        ];
        const color = '#6e3a99ff';
        const type = 'primaryColor';
        service.addColor(color, type);
        expect(service.colors.length).toEqual(service['COLOR_SIZE_LIMIT']);
        expect(service.colors[0]).toEqual(color);
        expect(service.colors[service['COLOR_SIZE_LIMIT'] - 1]).toEqual('#6e3a97ff');
    });

    it('addColor should call setColor', () => {
        const color = '#6e3a93ff';
        const type = 'primaryColor';
        service.addColor(color, type);
        expect(service.colors.length).toEqual(1);
        expect(setColorSpy).toHaveBeenCalled();
    });

    it('setColor should set the primaryColor when primaryColor string is passed in the arguments', () => {
        const color = '#6e3a93ff';
        const type = 'primaryColor';
        service.setColor(type, color);
        expect(service.primaryColor).toEqual(color);
    });

    it('setColor should set the primaryColor when left string is passed in the arguments', () => {
        const color = '#6e3a93ff';
        const type = 'left';
        service.setColor(type, color);
        expect(service.primaryColor).toEqual(color);
    });

    it('setColor should set the secondaryColor when secondaryColor string is passed in the arguments', () => {
        const color = '#6e3a93ff';
        const type = 'secondaryColor';
        service.setColor(type, color);
        expect(service.secondaryColor).toEqual(color);
    });

    it('setColor should set the secondaryColor when right string is passed in the arguments', () => {
        const color = '#6e3a93ff';
        const type = 'right';
        service.setColor(type, color);
        expect(service.secondaryColor).toEqual(color);
    });

    it('invertColor should invert the primaryColor and secondaryColor ', () => {
        const primaryColor = '#6e3a93ff';
        const secondaryColor = '#000000';
        service.primaryColor = primaryColor;
        service.secondaryColor = secondaryColor;
        service.invertColors();
        expect(service.primaryColor).toEqual(secondaryColor);
        expect(service.secondaryColor).toEqual(primaryColor);
    });

    it('isSameColorAsPrevious should return true if color to add is same as the most recenttly added color in colors array ', () => {
        const color = '#6e3a93ff';
        const anotherColor = '#6e3a93ff';
        service.colors = [color];
        const result = service.isSameColorAsPrevious(anotherColor);
        expect(result).toEqual(true);
    });

    it('isSameColorAsPrevious should return true if color to add has the same opacity as the most recently added color in colors array ', () => {
        const color = '#6e3a9350';
        const anotherColor = '#6e3a9302';
        service.colors = [color];
        const result = service.isSameColorAsPrevious(anotherColor);
        expect(result).toEqual(true);
    });

    it('isSameColorAsPrevious should return false if color to add has the same opacity as the most recently added color in colors array ', () => {
        const color = '#6e3a9350';
        const anotherColor = '#000000';
        service.colors = [color];
        const result = service.isSameColorAsPrevious(anotherColor);
        expect(result).toEqual(false);
    });
});
