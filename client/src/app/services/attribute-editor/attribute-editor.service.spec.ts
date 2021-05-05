import { TestBed } from '@angular/core/testing';
import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { DEFAULT_STROKE_THICKNESS } from '@app/constants/constants';
import { DrawType } from '@app/constants/draw-type';
import { AttributeEditorService } from './attribute-editor.service';

describe('AttributeEditorService', () => {
    let service: AttributeEditorService;
    let attributesTest: ShapeAttribute;
    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(AttributeEditorService);
        attributesTest = new ShapeAttribute(DEFAULT_STROKE_THICKNESS, DrawType.Fill);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have attributes default stroke thickness, draw type fill', () => {
        expect(service.attributes.strokeThickness).toBe(attributesTest.strokeThickness);
        expect(service.attributes.strokeStyle).toBe(attributesTest.strokeStyle);
    });
});
