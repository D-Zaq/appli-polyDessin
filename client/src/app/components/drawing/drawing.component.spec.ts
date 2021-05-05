import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SIZE_CONTROLLER_HEIGHT, SIZE_CONTROLLER_WIDTH } from '@app/constants/constants';
import { MouseButton } from '@app/constants/mouse-button';
import { SizeControllerId } from '@app/constants/size-controller-id';
import { AttributeEditorService } from '@app/services/attribute-editor/attribute-editor.service';
import { AutoSaveService } from '@app/services/auto-save/auto-save.service';
import { ColorPickerService } from '@app/services/color/color-picker/color-picker.service';
import { DrawingService } from '@app/services/drawing/drawing.service';
import { LassoPolygonalService } from '@app/services/lasso-polygonal-selection/lasso-polygonal-selection.service';
import { SelectionService } from '@app/services/selection/selection.service';
import { EllipseService } from '@app/services/tools/ellipse/ellipse.service';
import { EraserService } from '@app/services/tools/eraser/eraser.service';
import { LineService } from '@app/services/tools/line/line.service';
import { PaintbucketService } from '@app/services/tools/paintbucket/paintbucket.service';
import { PencilService } from '@app/services/tools/pencil/pencil.service';
import { PipetteService } from '@app/services/tools/pipette/pipette.service';
import { PolygonService } from '@app/services/tools/polygon/polygon.service';
import { RectangleService } from '@app/services/tools/rectangle/rectangle.service';
import { SpraypaintService } from '@app/services/tools/spraypaint/spraypaint.service';
import { StampService } from '@app/services/tools/stamp/stamp.service';
import { TextService } from '@app/services/tools/text/text.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector/tool-selector.service';
import { UndoRedoService } from '@app/services/undo-redo/undo-redo.service';
import { DrawingComponent } from './drawing.component';

// tslint:disable: no-magic-numbers / reason : tests
describe('DrawingComponent', () => {
    let component: DrawingComponent;
    let fixture: ComponentFixture<DrawingComponent>;
    let toolSelectorServiceStub: ToolSelectorService;
    let pencilServiceStub: PencilService;
    // tslint:disable-next-line: prefer-const / reason : tests
    let ellipseServiceStub: EllipseService;
    // tslint:disable-next-line: prefer-const / reason : tests
    let rectangleServiceStub: RectangleService;
    // tslint:disable-next-line: prefer-const / reason : tests
    let lineServiceStub: LineService;
    // tslint:disable-next-line: prefer-const / reason : tests
    let eraserServiceStub: EraserService;
    let drawingStub: DrawingService;
    let attributeEditorService: AttributeEditorService;
    // tslint:disable-next-line: prefer-const / reason : tests
    let selectionServiceStub: SelectionService;
    // tslint:disable-next-line: prefer-const / reason : tests
    let spraypaintServiceStub: SpraypaintService;
    // tslint:disable-next-line: prefer-const / reason : tests
    let pipetteServiceStub: PipetteService;
    // tslint:disable-next-line: prefer-const / reason : tests
    let polygonServiceStub: PolygonService;
    // tslint:disable-next-line: prefer-const / reason : tests
    let paintbucketServiceStub: PaintbucketService;
    // tslint:disable-next-line: prefer-const / reason : tests
    let textServiceStub: TextService;
    // tslint:disable-next-line: prefer-const / reason : tests
    let stampServiceStub: StampService;
    // tslint:disable-next-line: variable-name
    // tslint:disable-next-line: prefer-const
    let lassoPolygonalServiceStub: LassoPolygonalService;

    let autoSaveServiceSpy: jasmine.SpyObj<AutoSaveService>;

    beforeEach(async(() => {
        attributeEditorService = new AttributeEditorService();
        const colorPickerService = new ColorPickerService();
        const undoRedoService = new UndoRedoService();
        drawingStub = new DrawingService(colorPickerService, undoRedoService);
        pencilServiceStub = new PencilService(drawingStub, attributeEditorService, undoRedoService);
        toolSelectorServiceStub = new ToolSelectorService(
            pencilServiceStub,
            ellipseServiceStub,
            rectangleServiceStub,
            eraserServiceStub,
            lineServiceStub,
            spraypaintServiceStub,
            polygonServiceStub,
            selectionServiceStub,
            pipetteServiceStub,
            paintbucketServiceStub,
            textServiceStub,
            lassoPolygonalServiceStub,
            stampServiceStub,
        );
        autoSaveServiceSpy = jasmine.createSpyObj('AutoSaveService', [
            'recoverAutoSaveDrawing',
            'isAutoSaveDrawingExists',
            'autoSaveDrawing',
            'clearLocalStorage',
        ]);
        TestBed.configureTestingModule({
            declarations: [DrawingComponent],
            providers: [
                { provide: PencilService, useValue: pencilServiceStub },
                { provide: ToolSelectorService, useValue: toolSelectorServiceStub },
                { provide: DrawingService, useValue: drawingStub },
                { provide: AutoSaveService, useValue: autoSaveServiceSpy },
            ],
        }).compileComponents();
        autoSaveServiceSpy = TestBed.inject(AutoSaveService) as jasmine.SpyObj<AutoSaveService>;
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DrawingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it(" should call the toolSelectorService's getCurrentTool and the tool's mouse move when receiving a mouse move event", () => {
        const event = {} as MouseEvent;
        const mouseEventSpy = spyOn(pencilServiceStub, 'onMouseMove').and.callThrough();
        const getCurrentToolSpy = spyOn(toolSelectorServiceStub, 'getCurrentTool').and.callThrough();
        component.onMouseMove(event);
        expect(getCurrentToolSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    // tslint:disable-next-line: max-line-length
    it(" should call the toolSelectorService's getCurrentTool and the tool's mouse down when receiving a mouse down event while resizing is disabled", () => {
        const event = {} as MouseEvent;
        drawingStub.isResizing = false;
        const mouseEventSpy = spyOn(pencilServiceStub, 'onMouseDown').and.callThrough();
        const getCurrentToolSpy = spyOn(toolSelectorServiceStub, 'getCurrentTool').and.callThrough();
        component.onMouseDown(event);
        expect(getCurrentToolSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    // tslint:disable-next-line;: max-line-length;
    it(" should not call the toolSelectorService's getCurrentTool and the tool's mouse down when receiving a mouse down event while resizing is enabled", () => {
        const event = {} as MouseEvent;
        drawingStub.isResizing = true;
        const mouseEventSpy = spyOn(pencilServiceStub, 'onMouseDown').and.callThrough();
        const getCurrentToolSpy = spyOn(toolSelectorServiceStub, 'getCurrentTool').and.callThrough();
        component.onMouseDown(event);
        expect(getCurrentToolSpy).toHaveBeenCalledTimes(0);
        expect(mouseEventSpy).toHaveBeenCalledTimes(0);
    });

    // tslint:disable-next-line: max-line-length
    it(" should call the toolSelectorService's getCurrentTool and the tool's mouse up when receiving a mouse up event while resizing is disabled", () => {
        const event = {} as MouseEvent;
        drawingStub.isResizing = false;
        const mouseEventSpy = spyOn(pencilServiceStub, 'onMouseUp').and.callThrough();
        const getCurrentToolSpy = spyOn(toolSelectorServiceStub, 'getCurrentTool').and.callThrough();
        component.onMouseUp(event);
        expect(getCurrentToolSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalled();
        expect(mouseEventSpy).toHaveBeenCalledWith(event);
    });

    // tslint:disable-next-line: no-unused-expression
    it(" should call the drawingService's updateEntireDrawingSurface and disablePreviewCanvasResizing when receiving a mouse up event while resizing is enabled", () => {
        const event = {} as MouseEvent;
        drawingStub.isResizing = true;
        const updateEntireDrawingSurfaceSpy = spyOn(drawingStub, 'updateEntireDrawingSurface').and.callThrough();
        const disablePreviewCanvasResizingSpy = spyOn(drawingStub, 'disablePreviewCanvasResizing').and.callThrough();
        component.onMouseUpWindow(event);
        expect(disablePreviewCanvasResizingSpy).toHaveBeenCalled();
        expect(updateEntireDrawingSurfaceSpy).toHaveBeenCalled();
    });

    it(" should call the drawingService's resizePreviewCanvas when receiving a window mouse move event", () => {
        const event = {} as MouseEvent;
        const resizePreviewCanvasSpy = spyOn(drawingStub, 'resizePreviewCanvas').and.callThrough();
        component.onMouseMoveWindow(event);
        expect(resizePreviewCanvasSpy).toHaveBeenCalled();
        expect(resizePreviewCanvasSpy).toHaveBeenCalledWith(event);
    });

    it('centerRightSizeControllerPosition should return the right position if the preview canvas is being postionned', () => {
        component.previewCanvas.nativeElement.height = 300;
        component.previewCanvas.nativeElement.width = 300;
        const sizeControllerPosition = {
            top: component.previewCanvas.nativeElement.height / 2 + 'px',
            left: component.previewCanvas.nativeElement.width - SIZE_CONTROLLER_WIDTH / 2 + 'px',
        };
        expect(component.centerRightSizeControllerPosition()).toEqual(sizeControllerPosition);
    });

    it('centerRightSizeControllerPosition should return the right position if the preview canvas is not being postionned', () => {
        drawingStub.canvasSize.x = 300;
        drawingStub.canvasSize.y = 300;
        component.previewCanvas = null as never;
        const sizeControllerPosition = {
            top: drawingStub.canvasSize.y / 2 + 'px',
            left: drawingStub.canvasSize.x - SIZE_CONTROLLER_WIDTH / 2 + 'px',
        };
        expect(component.centerRightSizeControllerPosition()).toEqual(sizeControllerPosition);
    });

    it('centerBottomSizeControllerPosition should return the right position if the preview canvas is being postionned', () => {
        component.previewCanvas.nativeElement.height = 300;
        component.previewCanvas.nativeElement.width = 300;
        const sizeControllerPosition = {
            top: component.previewCanvas.nativeElement.height - SIZE_CONTROLLER_HEIGHT / 2 + 'px',
            left: component.previewCanvas.nativeElement.width / 2 + 'px',
        };
        expect(component.centerBottomSizeControllerPosition()).toEqual(sizeControllerPosition);
    });

    it('centerBottomSizeControllerPosition should return the right position if the preview canvas is not being postionned', () => {
        drawingStub.canvasSize.x = 300;
        drawingStub.canvasSize.y = 300;
        component.previewCanvas = null as never;
        const sizeControllerPosition = {
            top: drawingStub.canvasSize.y - SIZE_CONTROLLER_HEIGHT / 2 + 'px',
            left: drawingStub.canvasSize.x / 2 + 'px',
        };
        expect(component.centerBottomSizeControllerPosition()).toEqual(sizeControllerPosition);
    });

    it('rightBottomSizeControllerPosition should return the right position if the preview canvas is being postionned', () => {
        component.previewCanvas.nativeElement.height = 300;
        component.previewCanvas.nativeElement.width = 300;
        const sizeControllerPosition = {
            top: component.previewCanvas.nativeElement.height - SIZE_CONTROLLER_HEIGHT / 2 + 'px',
            left: component.previewCanvas.nativeElement.width - SIZE_CONTROLLER_WIDTH / 2 + 'px',
        };
        expect(component.rightBottomSizeControllerPosition()).toEqual(sizeControllerPosition);
    });

    it('rightBottomSizeControllerPosition should return the right position if the preview canvas is not being postionned', () => {
        drawingStub.canvasSize.x = 300;
        drawingStub.canvasSize.y = 300;
        component.previewCanvas = null as never;
        const sizeControllerPosition = {
            top: drawingStub.canvasSize.y - SIZE_CONTROLLER_HEIGHT / 2 + 'px',
            left: drawingStub.canvasSize.x - SIZE_CONTROLLER_WIDTH / 2 + 'px',
        };
        expect(component.rightBottomSizeControllerPosition()).toEqual(sizeControllerPosition);
    });

    it("enableCanvasResizing should set drawing service's isResizing to true and the right sizeControllerId on mouse left", () => {
        const event = { button: MouseButton.Left } as MouseEvent;
        drawingStub.isResizing = false;
        drawingStub.resizingPreviewDashedLine = false;
        component.enableCanvasResizing(event, SizeControllerId.CenterRightSizeController);
        expect(drawingStub.isResizing).toEqual(true);
        expect(drawingStub.resizingPreviewDashedLine).toEqual(true);
        expect(drawingStub.sizeControllerId).toEqual(SizeControllerId.CenterRightSizeController);
    });

    it("enableCanvasResizing should not set drawing service's isResizing to true and the new sizeControllerId when not on mouse left", () => {
        const event = { button: MouseButton.Right } as MouseEvent;
        drawingStub.isResizing = false;
        drawingStub.resizingPreviewDashedLine = false;
        component.enableCanvasResizing(event, SizeControllerId.CenterRightSizeController);
        expect(drawingStub.isResizing).toEqual(false);
        expect(drawingStub.resizingPreviewDashedLine).toEqual(false);
        expect(drawingStub.sizeControllerId).toEqual(SizeControllerId.DefaultId);
    });

    it("resizingPreviewDashedLine should return drawingService's resizingPreviewDashedLine", () => {
        expect(component.resizingPreviewDashedLine).toEqual(drawingStub.resizingPreviewDashedLine);
    });

    it('sizeControllerId should return type SizeControllerId', () => {
        expect(component.sizeControllerId).toEqual(SizeControllerId);
    });

    it("width should return drawingService's canvasSize width ", () => {
        expect(component.width).toEqual(drawingStub.canvasSize.x);
    });

    it("height should return drawingService's canvasSize height ", () => {
        expect(component.height).toEqual(drawingStub.canvasSize.y);
    });

    it("height should return toolSelector's isEraserSelected ", () => {
        const isEraserSelectedSpy = spyOn(toolSelectorServiceStub, 'isEraserSelected').and.callThrough();
        component.isEraser();
        expect(isEraserSelectedSpy).toHaveBeenCalled();
    });

    it("ngOnInit should call autoSaveService's recoverAutoSaveDrawing when there is an auto saved drawing", () => {
        autoSaveServiceSpy.isAutoSaveDrawingExists.and.callFake(() => {
            return true;
        });
        component.ngOnInit();
        expect(autoSaveServiceSpy.recoverAutoSaveDrawing).toHaveBeenCalled();
    });

    it("ngOnInit should not call autoSaveService's recoverAutoSaveDrawing when there is an auto saved drawing", () => {
        autoSaveServiceSpy.isAutoSaveDrawingExists.and.callFake(() => {
            return false;
        });
        component.ngOnInit();
        expect(autoSaveServiceSpy.recoverAutoSaveDrawing).not.toHaveBeenCalled();
    });
});
