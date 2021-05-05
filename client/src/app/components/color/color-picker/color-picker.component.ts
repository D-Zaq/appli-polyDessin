import { Component, Input } from '@angular/core';
import { ColorHistoryService } from '@app/services/color/color-history/color-history.service';
import { ColorPickerService } from '@app/services/color/color-picker/color-picker.service';

@Component({
    selector: 'app-color-picker',
    templateUrl: './color-picker.component.html',
    styleUrls: ['./color-picker.component.css'],
})
export class ColorPickComponent {
    isOnChange: boolean;

    constructor(private colorPickerService: ColorPickerService, private colorHistoryService: ColorHistoryService) {
        this.isOnChange = false;
    }

    @Input('primaryColor')
    set primaryColor(color: string) {
        if (this.isOnChange) {
            this.colorPickerService.addColor(color, 'primaryColor');
            this.colorHistoryService.drawColorHistory();
            this.isOnChange = false;
        }
    }

    get primaryColor(): string {
        return this.colorPickerService.primaryColor;
    }

    @Input('secondaryColor')
    set secondaryColor(color: string) {
        if (this.isOnChange) {
            this.colorPickerService.addColor(color, 'secondaryColor');
            this.colorHistoryService.drawColorHistory();
            this.isOnChange = false;
        }
    }

    get secondaryColor(): string {
        return this.colorPickerService.secondaryColor;
    }

    onChange(): void {
        this.isOnChange = true;
    }

    onClick(): void {
        this.colorPickerService.invertColors();
    }
}
