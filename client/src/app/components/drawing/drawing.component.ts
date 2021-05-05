import { AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { SizeControllerPosition } from '@app/classes/size-controller-positions';
import { SIZE_CONTROLLER_HEIGHT, SIZE_CONTROLLER_WIDTH } from '@app/constants/constants';
import { MouseButton } from '@app/constants/mouse-button';
import { SizeControllerId } from '@app/constants/size-controller-id';
import { ToolName } from '@app/constants/tool-name';
import { AutoSaveService } from '@app/services/auto-save/auto-save.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector/tool-selector.service';

@Component({
    selector: 'app-drawing',
    templateUrl: './drawing.component.html',
    styleUrls: ['./drawing.component.scss'],
})
export class DrawingComponent implements AfterViewInit, OnInit {
    constructor(
        private drawingService: DrawingService,
        private toolSelectorService: ToolSelectorService,
        private automaticSavingService: AutoSaveService,
    ) {
        if (this.automaticSavingService.isAutoSaveDrawingExists()) {
            this.automaticSavingService.recoverAutoSaveDrawing();
        }
    }
    @ViewChild('baseCanvas', { static: false }) baseCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('previewCanvas', { static: false }) previewCanvas: ElementRef<HTMLCanvasElement>;
    @ViewChild('gridCanvas', { static: false }) gridCanvas: ElementRef<HTMLCanvasElement>;

    private baseCtx: CanvasRenderingContext2D;
    private previewCtx: CanvasRenderingContext2D;
    private gridCtx: CanvasRenderingContext2D;
    nRightClicks: number = 0;
    ngAfterViewInit(): void {
        this.baseCtx = this.baseCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.previewCtx = this.previewCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gridCtx = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawingService.baseCtx = this.baseCtx;
        this.drawingService.previewCtx = this.previewCtx;
        this.drawingService.gridCtx = this.gridCtx;
        this.drawingService.canvas = this.baseCanvas.nativeElement;
    }

    ngOnInit(): void {
        if (this.automaticSavingService.isAutoSaveDrawingExists()) {
            this.automaticSavingService.recoverAutoSaveDrawing();
        }
    }

    onMouseMove(event: MouseEvent): void {
        this.toolSelectorService.getCurrentTool().onMouseMove(event);
    }

    onMouseDown(event: MouseEvent): void {
        if (!this.drawingService.isResizing) {
            this.toolSelectorService.getCurrentTool().onMouseDown(event);
        }
    }

    @HostListener('contextmenu', ['$event'])
    onRightClick(event: Event): void {
        event.preventDefault();
    }

    @HostListener(':mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        if (!this.drawingService.isResizing) {
            this.toolSelectorService.getCurrentTool().onMouseUp(event);
        }
    }
    @HostListener('window:mouseup', ['$event'])
    onMouseUpWindow(event: MouseEvent): void {
        if (this.drawingService.isResizing) {
            this.drawingService.redrawCanvasImage(this.previewCanvas.nativeElement.height, this.previewCanvas.nativeElement.width);
            this.drawingService.disablePreviewCanvasResizing();
        }
        setTimeout(() => {
            this.automaticSavingService.autoSaveDrawing();
        }, 0);
    }

    @HostListener('dblclick', ['$event'])
    onDblClick(event: MouseEvent): void {
        this.toolSelectorService.getCurrentTool().onDblClick(event);
    }

    @HostListener('window:mousemove', ['$event'])
    onMouseMoveWindow(event: MouseEvent): void {
        this.drawingService.resizePreviewCanvas(event);

        switch (this.toolSelectorService.getCurrentTool().getName()) {
            case ToolName.Eraser:
            case ToolName.Stamp:
                this.baseCanvas.nativeElement.classList.add('no-cursor');
                this.previewCanvas.nativeElement.classList.add('no-cursor');
                this.gridCanvas.nativeElement.classList.add('no-cursor');
                break;
            default:
                this.baseCanvas.nativeElement.classList.remove('no-cursor');
                this.previewCanvas.nativeElement.classList.remove('no-cursor');
                this.gridCanvas.nativeElement.classList.remove('no-cursor');
        }
    }

    @HostListener('mouseleave', ['$event'])
    onMouseLeave(event: MouseEvent): void {
        if (!this.drawingService.isResizing) this.toolSelectorService.getCurrentTool().onMouseUp(event);
    }

    centerRightSizeControllerPosition(): SizeControllerPosition {
        if (this.previewCanvas) {
            const previewCanvasElement = this.previewCanvas.nativeElement;

            const sizeControllerPosition: SizeControllerPosition = {
                top: previewCanvasElement.height / 2 + 'px',
                left: previewCanvasElement.width - SIZE_CONTROLLER_WIDTH / 2 + 'px',
            };
            return sizeControllerPosition;
        } else {
            const sizeControllerPosition: SizeControllerPosition = {
                top: this.height / 2 + 'px',
                left: this.width - SIZE_CONTROLLER_WIDTH / 2 + 'px',
            };
            return sizeControllerPosition;
        }
    }

    centerBottomSizeControllerPosition(): SizeControllerPosition {
        if (this.previewCanvas) {
            const previewCanvasElement = this.previewCanvas.nativeElement;

            const sizeControllerPosition: SizeControllerPosition = {
                top: previewCanvasElement.height - SIZE_CONTROLLER_HEIGHT / 2 + 'px',
                left: previewCanvasElement.width / 2 + 'px',
            };
            return sizeControllerPosition;
        } else {
            const sizeControllerPosition: SizeControllerPosition = {
                top: this.height - SIZE_CONTROLLER_HEIGHT / 2 + 'px',
                left: this.width / 2 + 'px',
            };
            return sizeControllerPosition;
        }
    }

    rightBottomSizeControllerPosition(): SizeControllerPosition {
        if (this.previewCanvas) {
            const previewCanvasElement = this.previewCanvas.nativeElement;

            const sizeControllerPosition: SizeControllerPosition = {
                top: previewCanvasElement.height - SIZE_CONTROLLER_HEIGHT / 2 + 'px',
                left: previewCanvasElement.width - SIZE_CONTROLLER_WIDTH / 2 + 'px',
            };
            return sizeControllerPosition;
        } else {
            const sizeControllerPosition: SizeControllerPosition = {
                top: this.height - SIZE_CONTROLLER_HEIGHT / 2 + 'px',
                left: this.width - SIZE_CONTROLLER_WIDTH / 2 + 'px',
            };
            return sizeControllerPosition;
        }
    }

    enableCanvasResizing(event: MouseEvent, sizeControllerId: SizeControllerId): void {
        if (event.button === MouseButton.Left) {
            this.drawingService.isResizing = true;
            this.drawingService.sizeControllerId = sizeControllerId;
            this.drawingService.resizingPreviewDashedLine = true;
        }
    }

    get resizingPreviewDashedLine(): boolean {
        return this.drawingService.resizingPreviewDashedLine;
    }

    get sizeControllerId(): typeof SizeControllerId {
        return SizeControllerId;
    }

    get width(): number {
        return this.drawingService.canvasSize.x;
    }

    get height(): number {
        return this.drawingService.canvasSize.y;
    }

    isEraser(): boolean {
        return this.toolSelectorService.isEraserSelected();
    }
}
