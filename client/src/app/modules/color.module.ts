import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ColorHistoryComponent } from '@app/components/color/color-history/color-history.component';
import { ColorPickComponent } from '@app/components/color/color-picker/color-picker.component';
import { ColorHistoryService } from '@app/services/color/color-history/color-history.service';
import { ColorPickerService } from '@app/services/color/color-picker/color-picker.service';
import { ColorPickerModule } from '@syncfusion/ej2-angular-inputs';

@NgModule({
    declarations: [ColorPickComponent, ColorHistoryComponent],
    imports: [CommonModule, ColorPickerModule, MatButtonModule],
    exports: [ColorPickComponent],
    providers: [ColorPickerService, ColorHistoryService],
})
export class ColorModule {}
