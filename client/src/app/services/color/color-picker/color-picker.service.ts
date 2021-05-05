import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ColorPickerService {
    primaryColor: string;
    secondaryColor: string;
    private COLOR_SIZE_LIMIT: number = 10;
    colors: string[];
    content: BehaviorSubject<string>;
    share: Observable<string>;

    constructor() {
        this.primaryColor = '#000000';
        this.secondaryColor = '#000000';
        this.content = new BehaviorSubject<string>(this.primaryColor);
        this.share = this.content.asObservable();
    }

    addColor(color: string, type: string): void {
        if (this.colors === undefined) {
            this.colors = [color];
        } else if (!this.isSameColorAsPrevious(color)) {
            this.colors.unshift(color);
            if (this.colors.length > this.COLOR_SIZE_LIMIT) {
                this.colors.pop();
            }
        }
        this.setColor(type, color);
    }

    setColor(type: string, color: string): void {
        switch (type) {
            case 'primaryColor':
            case 'left':
                this.primaryColor = color;
                this.content.next(this.primaryColor);
                break;
            case 'secondaryColor':
            case 'right':
                this.secondaryColor = color;
                break;
        }
    }

    invertColors(): void {
        const tempColor = this.primaryColor;
        this.primaryColor = this.secondaryColor;
        this.secondaryColor = tempColor;
    }

    isSameColorAsPrevious(color: string): boolean {
        const previousColor = this.colors[0];
        const removedOpacity = previousColor.substring(0, previousColor.length - 2);
        return removedOpacity === color.substring(0, color.length - 2);
    }
}
