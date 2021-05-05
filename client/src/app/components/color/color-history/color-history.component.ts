import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { ColorHistoryService } from '@app/services/color/color-history/color-history.service';

@Component({
    selector: 'app-color-history',
    templateUrl: './color-history.component.html',
    styleUrls: ['./color-history.component.css'],
})
export class ColorHistoryComponent implements AfterViewInit {
    @ViewChild('canvas')
    canvas: ElementRef<HTMLCanvasElement>;

    constructor(private colorHistoryService: ColorHistoryService) {}

    ngAfterViewInit(): void {
        this.colorHistoryService.onInit(this.canvas.nativeElement);
        this.addColorEventListeners();
    }

    addColorEventListeners(): void {
        // tslint:disable-next-line: no-non-null-assertion // reason: elem can be null
        const elem = document.getElementById('canvas')!;

        elem.addEventListener('click', (event) => {
            const elemLeft = elem.offsetLeft + elem.clientLeft;
            const elemTop = elem.offsetTop + elem.clientTop;
            const x = event.pageX - elemLeft;
            const y = event.pageY - elemTop;
            this.colorHistoryService.onClick(x, y, 'left');
        });

        elem.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            const elemLeft = elem.offsetLeft + elem.clientLeft;
            const elemTop = elem.offsetTop + elem.clientTop;
            const x = event.pageX - elemLeft;
            const y = event.pageY - elemTop;
            this.colorHistoryService.onClick(x, y, 'right');
        });
    }
}
