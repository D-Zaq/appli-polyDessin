import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { DrawingService } from '@app/services/drawing/drawing.service';
@Component({
    selector: 'app-export-drawing-dialog',
    templateUrl: './export-drawing-dialog.component.html',
    styleUrls: ['./export-drawing-dialog.component.scss'],
})
export class ExportDrawingDialogComponent implements AfterViewInit {
    @ViewChild('imageContainer') imageContainer: ElementRef;
    @ViewChild('imageCanvas') imageCanvas: ElementRef<HTMLCanvasElement>;
    imageCtx: CanvasRenderingContext2D;

    imageFormat: string = 'png';
    imageFilter: string = 'none';
    appliedFilter: string;
    imageTitle: string = '';
    imageTitleForm: FormControl = new FormControl('', Validators.required);
    private url: string = 'https://api.imgur.com/3/image';
    private clientId: string = 'a62187743487f66';
    // tslint:disable-next-line: no-any reason: public url image
    imageLink: any;
    isImgurExportSucces: boolean = false;

    constructor(public drawingService: DrawingService, public dialogRef: MatDialogRef<ExportDrawingDialogComponent>, private http: HttpClient) {}

    ngAfterViewInit(): void {
        this.imageCtx = this.imageCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.imageCanvas.nativeElement.width = this.drawingService.canvas.width;
        this.imageCanvas.nativeElement.height = this.drawingService.canvas.height;
        this.drawFilterPreviewCanvas();
    }

    applyFilter(): void {
        this.imageCtx.filter = 'none';
        switch (this.imageFilter) {
            case 'none':
                this.appliedFilter = 'none';
                break;
            case 'invert':
                this.appliedFilter = 'invert(100%)';
                break;
            case 'grayscale':
                this.appliedFilter = 'grayscale(100%)';
                break;
            case 'saturate':
                this.appliedFilter = 'saturate(200%)';
                break;
            case 'opacity':
                this.appliedFilter = 'opacity(50%)';
                break;
            case 'drop-shadow':
                this.appliedFilter = 'drop-shadow(16px 16px 10px black)';
                break;
        }
        this.imageCtx.filter = this.appliedFilter;
        this.drawFilterPreviewCanvas();
        this.appliedFilter = 'none';
        this.imageFilter = 'none';
    }

    drawFilterPreviewCanvas(): void {
        this.fillCanvasWithWhiteBackgroundColor();
        this.imageCtx.drawImage(
            this.drawingService.canvas,
            0,
            0,
            this.drawingService.canvas.width,
            this.drawingService.canvas.height,
            0,
            0,
            this.imageCanvas.nativeElement.width,
            this.imageCanvas.nativeElement.height,
        );
    }

    exportImage(): void {
        const format = 'image/' + this.imageFormat;
        const fileName = this.imageTitleForm.value + '.' + this.imageFormat;
        this.fillCanvasWithWhiteBackgroundColor();
        this.imageCtx.drawImage(this.drawingService.canvas, 0, 0);
        this.imageCtx.filter = 'none';
        const imageUrl = this.imageCanvas.nativeElement.toDataURL(format);
        this.imageContainer.nativeElement.href = imageUrl;
        this.imageContainer.nativeElement.download = fileName;
        this.imageContainer.nativeElement.click();
        this.dialogRef.close();
    }

    async imgurExportImage(): Promise<void> {
        const format = 'image/' + this.imageFormat;
        this.fillCanvasWithWhiteBackgroundColor();
        this.imageCtx.drawImage(this.drawingService.canvas, 0, 0);
        this.imageCtx.filter = 'none';
        const imageUrl = this.imageCanvas.nativeElement.toDataURL(format).split(',')[1];
        const header = new HttpHeaders({
            authorization: 'Client-ID ' + this.clientId,
        });
        this.isImgurExportSucces = true;
        // tslint:disable-next-line: no-any reason : access data link
        this.imageLink = await this.http.post(this.url, imageUrl, { headers: header }).toPromise();
    }

    fillCanvasWithWhiteBackgroundColor(): void {
        this.imageCtx.fillStyle = '#FFFFFF';
        this.imageCtx.fillRect(0, 0, this.imageCtx.canvas.width, this.imageCtx.canvas.height);
    }
}
