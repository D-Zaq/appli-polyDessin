import { Injectable } from '@angular/core';
import { SidebarButton } from '@app/classes/sidebar-button';
import { Tool } from '@app/classes/tool';
import { toolButtons } from '@app/constants/tool-button';
import { ToolName } from '@app/constants/tool-name';
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
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ToolSelectorService {
    private currentTool: Tool;
    private toolButtons: SidebarButton[];

    content: BehaviorSubject<Tool>;
    share: Observable<Tool>;

    constructor(
        private pencilService: PencilService,
        private ellipseService: EllipseService,
        private rectangleService: RectangleService,
        private eraserService: EraserService,
        private lineService: LineService,
        private spraypaintService: SpraypaintService,
        private polygonService: PolygonService,
        private selectionService: SelectionService,
        private pipetteService: PipetteService,
        private paintbucketService: PaintbucketService,
        private textService: TextService,
        private lassoService: LassoPolygonalService,
        private stampService: StampService,
    ) {
        this.currentTool = pencilService;
        this.toolButtons = toolButtons;

        this.content = new BehaviorSubject<Tool>(this.currentTool);
        this.share = this.content.asObservable();
    }
    getCurrentTool(): Tool {
        return this.currentTool;
    }

    updateCurrentTool(toolName: string): void {
        this.selectionService.onToolChange();
        this.textService.onToolChange();
        switch (toolName) {
            case ToolName.Pencil:
                this.selectionService.onToolChange();
                this.currentTool = this.pencilService;
                this.content.next(this.currentTool);
                break;
            case ToolName.Ellipse:
                this.selectionService.onToolChange();
                this.currentTool = this.ellipseService;
                this.content.next(this.currentTool);
                break;
            case ToolName.Line:
                this.selectionService.onToolChange();
                this.currentTool = this.lineService;
                this.content.next(this.currentTool);
                break;
            case ToolName.Rectangle:
                this.selectionService.onToolChange();
                this.currentTool = this.rectangleService;
                this.content.next(this.currentTool);
                break;
            case ToolName.Eraser:
                this.selectionService.onToolChange();
                this.currentTool = this.eraserService;
                this.content.next(this.currentTool);
                break;
            case ToolName.Spraypaint:
                this.selectionService.onToolChange();
                this.currentTool = this.spraypaintService;
                this.content.next(this.currentTool);
                break;
            case ToolName.Pipette:
                this.selectionService.onToolChange();
                this.currentTool = this.pipetteService;
                this.content.next(this.currentTool);
                break;
            case ToolName.Polygone:
                this.selectionService.onToolChange();
                this.currentTool = this.polygonService;
                this.content.next(this.currentTool);
                break;
            case ToolName.PaintBucket:
                this.selectionService.onToolChange();
                this.currentTool = this.paintbucketService;
                this.content.next(this.currentTool);
                break;
            case ToolName.Text:
                this.currentTool = this.textService;
                this.content.next(this.currentTool);
                break;
            case ToolName.Stamp:
                this.currentTool = this.stampService;
                this.content.next(this.currentTool);
                break;

            // SELECTOR TOOLS
            case ToolName.RectangleSelection:
                this.selectionService.onInit(ToolName.RectangleSelection);
                this.currentTool = this.selectionService;
                this.content.next(this.currentTool);
                break;
            case ToolName.EllipseSelection:
                this.selectionService.onInit(ToolName.EllipseSelection);
                this.currentTool = this.selectionService;
                this.content.next(this.currentTool);
                break;
            case ToolName.LassoPolygonal:
                this.lassoService.onInit(); // à changer
                this.currentTool = this.lassoService;
                this.content.next(this.currentTool);
                break;
        }
    }

    getToolButtons(index: number): SidebarButton {
        return this.toolButtons[index];
    }

    isEraserSelected(): boolean {
        return this.currentTool === this.eraserService;
    }

    setCurrentTool(newTool: Tool): void {
        this.currentTool = newTool;
    }
}
