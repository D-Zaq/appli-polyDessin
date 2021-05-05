import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { PipetteService } from '@app/services/tools/pipette/pipette.service';

@Component({
    selector: 'app-zoom-canvas',
    templateUrl: './zoom-canvas.component.html',
    styleUrls: ['./zoom-canvas.component.scss'],
})
export class ZoomCanvasComponent implements AfterViewInit {
    @ViewChild('canvas')
    canvas: ElementRef<HTMLCanvasElement>;

    constructor(private pipetteService: PipetteService) {}

    ngAfterViewInit(): void {
        this.pipetteService.onInit(this.canvas.nativeElement);
    }
}
