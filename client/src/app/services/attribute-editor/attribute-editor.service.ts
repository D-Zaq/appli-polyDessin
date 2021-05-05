import { Injectable } from '@angular/core';
import { ShapeAttribute } from '@app/classes/shapes/shape-attribute';
import { TextAttributes } from '@app/classes/shapes/text/text-attributes';
import { DEFAULT_STROKE_THICKNESS } from '@app/constants/constants';
import { DrawType } from '@app/constants/draw-type';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AttributeEditorService {
    attributes: ShapeAttribute;
    content: BehaviorSubject<ShapeAttribute>;
    share: Observable<ShapeAttribute>;

    constructor() {
        this.attributes = new ShapeAttribute(DEFAULT_STROKE_THICKNESS, DrawType.Fill);
        this.content = new BehaviorSubject<ShapeAttribute>(this.attributes);
        this.share = this.content.asObservable();
    }

    setTextAttributes(newTextAttributes: TextAttributes): void {
        this.attributes.textAttributes = newTextAttributes;
        this.content.next(this.attributes);
    }
}
