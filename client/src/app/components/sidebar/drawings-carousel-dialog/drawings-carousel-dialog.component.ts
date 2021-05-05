import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CarouselImage } from '@app/classes/carousel-image';
import { ImageSize } from '@app/classes/image-size';
import { ConfirmationDialogComponent } from '@app/components/sidebar/drawings-carousel-dialog/confirmation-dialog/confirmation-dialog.component';
import { NO_CONTENT_HTTP_STATUS } from '@app/constants/constants';
import { DatabaseService } from '@app/services/database/database.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { Drawing } from '@common/communication/drawing';
import { NgImageSliderComponent } from 'ng-image-slider';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-drawings-carousel-dialog',
    templateUrl: './drawings-carousel-dialog.component.html',
    styleUrls: ['./drawings-carousel-dialog.component.scss'],
})
export class DrawingsCarouselDialogComponent implements AfterViewInit {
    @ViewChild('carouselImagesSlider', { static: false }) imagesSlider: NgImageSliderComponent;
    constructor(
        public drawingService: DrawingService,
        public dialogRef: MatDialogRef<DrawingsCarouselDialogComponent>,
        private databaseService: DatabaseService,
        private snackBar: MatSnackBar,
        private dialog: MatDialog,
    ) {}

    drawings: Drawing[] = [];
    carouselImages: CarouselImage[] = [];
    drawingTags: string[] = [];
    drawingTagsForm: FormControl = new FormControl('', [Validators.pattern('^[A-Za-z0-9ñÑáéèêíóôúûÁÉÈÊÍÓÔÚÛ]+$'), Validators.required]);
    visible: boolean = true;
    removable: boolean = true;
    addOnBlur: boolean = true;
    readonly separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];
    isGettingImages: boolean = false;
    imageSize: ImageSize;
    drawingsContainingTags: Drawing[] = [];

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.getDrawings();
        }, 0);
    }

    getDrawings(): Observable<number | Drawing[]> {
        this.isGettingImages = true;
        const drawings: Observable<number | Drawing[]> = this.databaseService.getDrawings();
        drawings.subscribe((data) => {
            this.createCarouselImages(data);
            this.isGettingImages = false;
        });

        return drawings;
    }

    // tslint:disable-next-line: no-any reason: iterate through array
    createCarouselImages(drawings: any): void {
        this.drawings = [];
        for (const drawing of drawings) {
            const drawingImage = new Image();
            drawingImage.src = drawing.url;
            drawingImage.onload = () => {
                this.drawings.push(drawing);
                this.filterCarrouselImagesWithTags();
            };
        }
    }

    setCarouselImages(drawings: Drawing[]): void {
        // while (this.carouselImages.length) this.carouselImages.pop();
        this.carouselImages = [{} as CarouselImage];
        this.imagesSlider.images.length = 0;
        for (const carrouselImage of drawings) {
            this.carouselImages.push(this.createCarouselImage(carrouselImage));
        }
        if (drawings.length <= 2) this.imageSize = { width: '1200px', height: '600px' };
        else this.imageSize = { width: '395px', height: '300px' };
        // else this.imageSize = { width: '600px', height: '500px', space: 4 };
        this.imagesSlider.setSliderImages(this.carouselImages);
        this.imagesSlider.next();
    }

    createCarouselImage(image: Drawing): CarouselImage {
        const carouselImage: CarouselImage = {
            image: image.url,
            thumbImage: image.url,
            title: 'Nom du dessin: ' + image.name + this.getTags(image),
            alt: image.name,
        };
        return carouselImage;
    }

    getTags(image: Drawing): string {
        if (image.tags.length === 0) {
            return '';
        } else {
            let tags = '';
            if (image.tags.length > 0) {
                for (const tag of image.tags) {
                    tags += tag + ',';
                }
            }
            return '\nLes tags: ' + tags.substring(0, tags.length - 1);
        }
    }

    getDrawingsContainingTags(): Drawing[] {
        this.drawingsContainingTags = [];
        if (this.drawingTags.length !== 0) {
            for (const drawing of this.drawings) {
                for (const tag of this.drawingTags) {
                    if (drawing.tags.includes(tag)) {
                        this.drawingsContainingTags.push(drawing);
                        break;
                    }
                }
            }
            return this.drawingsContainingTags;
        } else {
            return this.drawings;
        }
    }

    filterCarrouselImagesWithTags(): void {
        const drawingsContainingTags = this.getDrawingsContainingTags();
        this.setCarouselImages(drawingsContainingTags);
    }

    openDrawing(event: number): void {
        if (!this.drawingService.isCanvasEmpty(this.drawingService.baseCtx)) {
            const drawingData: Drawing = this.drawings[event - 1];
            this.dialog.open(ConfirmationDialogComponent, { data: { drawingData } });
        } else {
            const image = new Image();
            image.src = this.drawings[event - 1].url;
            this.drawingService.baseCtx.canvas.width = image.width;
            this.drawingService.baseCtx.canvas.height = image.height;
            this.drawingService.previewCtx.canvas.width = image.width;
            this.drawingService.previewCtx.canvas.height = image.height;
            this.drawingService.canvasSize.x = image.width;
            this.drawingService.canvasSize.y = image.height;
            image.onload = () => {
                this.drawingService.clearCanvas(this.drawingService.baseCtx);
                this.drawingService.baseCtx.drawImage(image, 0, 0);
                this.drawingService.previewCtx.drawImage(image, 0, 0);
                this.drawingService.image = image;
                this.drawingService.updateUndoRedoActions(image.width, image.height);
                this.dialogRef.close();
            };
        }
    }

    openSnackBar(message: string, action: string, type: string): void {
        this.snackBar.open(message, action, {
            duration: 6000,
            verticalPosition: 'top',
            panelClass: [type],
        });
    }

    deleteDrawing(): void {
        if (this.drawings.length !== 0) {
            let index = 0;
            if (this.getDrawingsContainingTags().length <= 2) index = this.imagesSlider.visiableImageIndex - 1;
            else {
                this.imagesSlider.visiableImageIndex === this.getDrawingsContainingTags().length
                    ? (index = 0)
                    : (index = this.imagesSlider.visiableImageIndex);
            }
            const draw: Drawing = this.getDrawingsContainingTags()[index];
            this.databaseService.deleteDrawing(draw._id).subscribe((response) => {
                response !== NO_CONTENT_HTTP_STATUS
                    ? this.openSnackBar('votre dessin a été supprimé avec succès', 'Fermer', 'green-snackbar')
                    : this.openSnackBar('le dessin est introuvable au niveau du serveur', 'Fermer', 'red-snackbar');
                this.getDrawings();
            });
        }
    }

    addTag(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value;
        if (!this.drawingTagsForm.invalid) {
            if (this.drawingTags.includes(event.value)) this.deleteTag(event.value);
            if ((value || '').trim()) {
                this.drawingTags.push(value);
                this.filterCarrouselImagesWithTags();
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
            this.filterCarrouselImagesWithTags();
        }
    }
}
