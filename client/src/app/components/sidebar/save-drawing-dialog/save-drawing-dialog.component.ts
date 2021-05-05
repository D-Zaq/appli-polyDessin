import { ENTER, SPACE, TAB } from '@angular/cdk/keycodes';
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CREATED_HTTP_STATUS } from '@app/constants/constants';
import { DatabaseService } from '@app/services/database/database.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Drawing } from '@common/communication/drawing';

@Component({
    selector: 'app-save-drawing-dialog',
    templateUrl: './save-drawing-dialog.component.html',
    styleUrls: ['./save-drawing-dialog.component.scss'],
})
export class SaveDrawingDialogComponent implements AfterViewInit {
    constructor(
        public drawingService: DrawingService,
        public dialogRef: MatDialogRef<SaveDrawingDialogComponent>,
        private databaseService: DatabaseService,
        private snackBar: MatSnackBar,
    ) {}
    @ViewChild('imageCanvas') imageCanvas: ElementRef<HTMLCanvasElement>;
    imageCtx: CanvasRenderingContext2D;

    imageFormat: string = 'png';
    appliedFilter: string;
    imageTitle: string = '';
    imageTitleForm: FormControl = new FormControl('', [Validators.pattern('^[A-Za-z0-9ñÑáéèêíóôúûÁÉÈÊÍÓÔÚÛ]+$'), Validators.required]);
    drawingTags: string[] = [];
    drawingTagsForm: FormControl = new FormControl('', [Validators.pattern('^[A-Za-z0-9ñÑáéèêíóôúûÁÉÈÊÍÓÔÚÛ]+$'), Validators.required]);
    id: string = '';
    visible: boolean = true;
    removable: boolean = true;
    addOnBlur: boolean = true;
    readonly separatorKeysCodes: number[] = [ENTER, SPACE, TAB];
    isBeingSaved: boolean = false;

    ngAfterViewInit(): void {
        this.imageCtx = this.imageCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.imageCanvas.nativeElement.width = this.drawingService.canvas.width;
        this.imageCanvas.nativeElement.height = this.drawingService.canvas.height;
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

    openSnackBar(message: string, action: string, type: string): void {
        this.snackBar.open(message, action, {
            duration: 6000,
            verticalPosition: 'bottom',
            panelClass: [type],
        });
    }

    saveImage(): void {
        this.isBeingSaved = true;
        const format = 'image/' + this.imageFormat;
        this.id = Math.random() + this.imageTitleForm.value;
        this.fillCanvasWithWhiteBackgroundColor();
        this.imageCtx.drawImage(this.drawingService.canvas, 0, 0);
        const imageUrl = this.imageCanvas.nativeElement.toDataURL(format);
        const drawing: Drawing = { name: this.imageTitleForm.value, tags: this.drawingTags, _id: this.id, url: imageUrl };
        this.databaseService.sendDrawing(drawing).subscribe((response) => {
            response === CREATED_HTTP_STATUS
                ? this.openSnackBar('votre dessin a été sauvegardé avec succès', 'Fermer', 'green-snackbar')
                : this.openSnackBar('le serveur est actuellement indisponible', 'Fermer', 'red-snackbar');
            this.isBeingSaved = false;
        });
        this.id = '';
    }

    fillCanvasWithWhiteBackgroundColor(): void {
        this.imageCtx.fillStyle = '#FFFFFF';
        this.imageCtx.fillRect(0, 0, this.imageCtx.canvas.width, this.imageCtx.canvas.height);
    }

    addTag(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;
        if (!this.drawingTagsForm.invalid) {
            if (this.drawingTags.includes(event.value)) this.deleteTag(event.value);
            if ((value || '').trim()) {
                this.drawingTags.push(value);
            }
            if (input) {
                input.value = '';
            }
        }
    }

    deleteTag(tag: string): void {
        const index = this.drawingTags.indexOf(tag);

        if (index >= 0) {
            this.drawingTags.splice(index, 1);
        }
    }
}
