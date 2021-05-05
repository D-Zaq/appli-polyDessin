import { Component, HostListener } from '@angular/core';
import { TextAttributes } from '@app/classes/shapes/text/text-attributes';
import { ANGLE_INCREMENT_WHEEL, DEFAULT_NB_SIDES, DEFAULT_POLYGON, DEFAULT_STAMP_SIZE, MAX_ANGLE, MIN_ERASER_STROKE } from '@app/constants/constants';
import { DrawType } from '@app/constants/draw-type';
import { ToolName } from '@app/constants/tool-name';
import { AttributeEditorService } from '@app/services/attribute-editor/attribute-editor.service';
import { ClipboardService } from '@app/services/clipboard/clipboard.service';
import { SelectionService } from '@app/services/selection/selection.service';
import { ToolSelectorService } from '@app/services/tools/tool-selector/tool-selector.service';

@Component({
    selector: './app-attribute-editor',
    templateUrl: './attribute-editor.component.html',
    styleUrls: ['./attribute-editor.component.scss'],
})
export class AttributeEditorComponent {
    min: number;

    isAltKeyPressed: boolean;

    isRadioDisabled: boolean;
    isDiameterNeeded: boolean;
    isFrequencyNeeded: boolean;
    isDropletSizeNeeded: boolean;
    isThicknessValueNeeded: boolean;
    isRadioNeeded: boolean;
    isNbSidesNeeded: boolean;
    isSelectionButtonsNeeded: boolean;
    isToleranceNeeded: boolean;
    isStampEnabled: boolean;

    isTextNeeded: boolean;

    isApplyNeeded: boolean;
    isZoomCanvasNeeded: boolean;

    isFill: boolean;
    isOutline: boolean;
    isBoth: boolean;

    isBold: boolean;
    isItalic: boolean;
    textSize: number;

    thicknessValue: number;
    diameterValue: number;
    frequencyValue: number;
    dropletSize: number;
    nbPolygonSides: number;
    tolerance: number;

    stampAngle: number;
    stampScale: number;
    stampChoice: string;

    choice: DrawType;

    DEFAULT_FREQUENCY: number = 250;
    DEFAULT_DIAMETER: number = 50;
    DEFAULT_DROPLET_SIZE: number = 2;
    DEFAULT_TOLERANCE: number = 1;

    selectedFont: string;
    textAlignment: string;

    constructor(
        public attributeEditorService: AttributeEditorService,
        private toolSelectorService: ToolSelectorService,
        private clipboardService: ClipboardService,
        private selectionService: SelectionService,
    ) {
        this.toolSelectorService.share.subscribe((tool) => {
            if (tool.name !== ToolName.RectangleSelection && tool.name !== ToolName.EllipseSelection)
                this.attributeEditorService.attributes = this.toolSelectorService.getCurrentTool().getAttributes();

            this.selectRadio();
            this.isRadioNeeded = false;
            this.isThicknessValueNeeded = false;
            this.isDiameterNeeded = false;
            this.isFrequencyNeeded = false;
            this.isDropletSizeNeeded = false;
            this.isApplyNeeded = false;
            this.isZoomCanvasNeeded = false;
            this.isNbSidesNeeded = false;
            this.isSelectionButtonsNeeded = false;
            this.isToleranceNeeded = false;
            this.isTextNeeded = false;
            this.isStampEnabled = false;
            this.stampChoice = '';
            this.nbPolygonSides = DEFAULT_POLYGON;
            switch (tool.name) {
                case ToolName.Pencil:
                    this.min = 1;
                    this.isThicknessValueNeeded = true;
                    this.isApplyNeeded = true;
                    break;
                case ToolName.Rectangle:
                    this.min = 1;
                    this.isRadioNeeded = true;
                    this.isThicknessValueNeeded = true;
                    this.isApplyNeeded = true;
                    break;
                case ToolName.Spraypaint:
                    this.min = 1;
                    this.isDiameterNeeded = true;
                    this.isFrequencyNeeded = true;
                    this.isDropletSizeNeeded = true;
                    this.isApplyNeeded = true;
                    this.attributeEditorService.attributes.strokeInterval = this.DEFAULT_FREQUENCY;
                    this.attributeEditorService.attributes.strokeDiameter = this.DEFAULT_DIAMETER;
                    this.attributeEditorService.attributes.dropletSize = this.DEFAULT_DROPLET_SIZE;
                    break;
                case ToolName.Eraser:
                    this.min = MIN_ERASER_STROKE;
                    this.isThicknessValueNeeded = true;
                    this.isApplyNeeded = true;
                    break;
                case ToolName.Pipette:
                    this.isZoomCanvasNeeded = true;
                    break;
                case ToolName.Line:
                    this.min = 1;
                    this.isThicknessValueNeeded = true;
                    this.isApplyNeeded = true;
                    break;
                case ToolName.Ellipse:
                    this.min = 1;
                    this.isRadioNeeded = true;
                    this.isThicknessValueNeeded = true;
                    this.isApplyNeeded = true;
                    break;
                case ToolName.Polygone:
                    this.attributeEditorService.attributes.nbSides = this.nbPolygonSides;
                    this.min = 1;
                    this.isRadioDisabled = false;
                    this.isRadioNeeded = true;
                    this.isThicknessValueNeeded = true;
                    this.isNbSidesNeeded = true;
                    this.isApplyNeeded = true;
                    break;
                case ToolName.RectangleSelection:
                case ToolName.EllipseSelection:
                case ToolName.LassoPolygonal:
                    this.isSelectionButtonsNeeded = true;
                    break;
                case ToolName.PaintBucket:
                    this.min = 1;
                    this.isToleranceNeeded = true;
                    this.isApplyNeeded = true;
                    break;
                case ToolName.Text:
                    this.selectedFont = this.attributeEditorService.attributes.textAttributes.textFont;
                    this.textAlignment = this.attributeEditorService.attributes.textAttributes.textAlign;
                    this.textSize = this.attributeEditorService.attributes.textAttributes.textSize;
                    this.isBold = this.attributeEditorService.attributes.textAttributes.textBold;
                    this.isItalic = this.attributeEditorService.attributes.textAttributes.textItalic;
                    this.isTextNeeded = true;
                    this.isApplyNeeded = true;
                    break;
                case ToolName.Stamp:
                    this.isStampEnabled = true;
                    this.isApplyNeeded = true;
                    break;
            }
            this.thicknessValue = this.attributeEditorService.attributes.strokeThickness;
            this.choice = this.attributeEditorService.attributes.strokeStyle;

            this.dropletSize = this.attributeEditorService.attributes.dropletSize;
            this.frequencyValue = this.attributeEditorService.attributes.strokeInterval;
            this.diameterValue = this.attributeEditorService.attributes.strokeDiameter;
            this.tolerance = this.attributeEditorService.attributes.tolerance;
            this.stampAngle = this.attributeEditorService.attributes.stampAngle;
            this.stampScale = this.attributeEditorService.attributes.stampScale;
        });
    }

    // tslint:disable-next-line: cyclomatic-complexity || Reason: we need have multiple values to be handled by the slider
    sliderHandler(attributeName: string, event: number): void {
        switch (attributeName) {
            case 'thicknessValue':
                if (event != undefined) this.thicknessValue = event;
            case 'dropletSizeValue':
                if (event != undefined) this.dropletSize = event;
                break;
            case 'diameterValue':
                if (event != undefined) this.diameterValue = event;
                break;
            case 'frequencyValue':
                if (event != undefined) this.frequencyValue = event;
                break;
            case 'nbPolygonSides':
                if (event != undefined) this.nbPolygonSides = event;
                break;
            case 'tolerance':
                if (event != undefined) this.tolerance = event;
                break;
            case 'stampAngle':
                if (event != undefined) this.stampAngle = event;
                break;
            case 'stampScale':
                if (event != undefined) this.stampScale = event;
                break;
        }
    }

    stampSelectHandler(stampName: string): void {
        if (this.stampChoice) document.querySelector('#' + this.stampChoice)?.classList.remove('selected');
        document.querySelector('#' + stampName)?.classList.add('selected');
        this.stampChoice = stampName;
    }

    radioHandler(event: string): void {
        switch (event) {
            case '1':
                this.choice = DrawType.Fill;
                break;
            case '2':
                this.choice = DrawType.Outline;
                break;
            case '3':
                this.choice = DrawType.OutlineFill;
                break;
            default:
                this.choice = this.choice;
        }
    }

    applyHandler(): void {
        this.attributeEditorService.attributes.strokeThickness = this.thicknessValue;
        this.attributeEditorService.attributes.strokeStyle = this.choice;
        this.attributeEditorService.attributes.dropletSize = this.dropletSize;
        this.attributeEditorService.attributes.strokeInterval = this.frequencyValue;
        this.attributeEditorService.attributes.strokeDiameter = this.diameterValue;
        this.attributeEditorService.attributes.tolerance = this.tolerance;
        this.attributeEditorService.attributes.nbSides = this.nbPolygonSides ? this.nbPolygonSides : DEFAULT_NB_SIDES;
        this.attributeEditorService.attributes.stampAngle = this.stampAngle;
        this.attributeEditorService.attributes.stampScale = this.stampScale;

        if (this.stampChoice) {
            this.attributeEditorService.attributes.stampImage = new Image(DEFAULT_STAMP_SIZE * this.stampScale, DEFAULT_STAMP_SIZE * this.stampScale);
            this.attributeEditorService.attributes.stampImage.src = '../../../../assets/stamp/' + this.stampChoice + '.png';
        }
        const newTextAttributes: TextAttributes = {
            textFont: this.selectedFont,
            textSize: this.textSize,
            textBold: this.isBold,
            textItalic: this.isItalic,
            textAlign: this.textAlignment,
        };

        this.attributeEditorService.setTextAttributes(newTextAttributes);
        this.selectRadio();
    }

    cancelHandler(): void {
        this.choice = this.attributeEditorService.attributes.strokeStyle;
        this.thicknessValue = this.attributeEditorService.attributes.strokeThickness;
        this.dropletSize = this.attributeEditorService.attributes.dropletSize;
        this.frequencyValue = this.attributeEditorService.attributes.strokeInterval;
        this.diameterValue = this.attributeEditorService.attributes.strokeDiameter;
        this.tolerance = this.attributeEditorService.attributes.tolerance;
        this.nbPolygonSides = this.attributeEditorService.attributes.nbSides;
        this.isBold = this.attributeEditorService.attributes.textAttributes.textBold;
        this.isItalic = this.attributeEditorService.attributes.textAttributes.textItalic;
        this.textSize = this.attributeEditorService.attributes.textAttributes.textSize;
        this.selectedFont = this.attributeEditorService.attributes.textAttributes.textFont;
        this.textAlignment = this.attributeEditorService.attributes.textAttributes.textAlign;
        this.selectRadio();
    }

    private selectRadio(): void {
        this.isFill = false;
        this.isOutline = false;
        this.isBoth = false;

        switch (this.attributeEditorService.attributes.strokeStyle) {
            case DrawType.Fill:
                this.isFill = true;
                break;
            case DrawType.Outline:
                this.isOutline = true;
                break;
            case DrawType.OutlineFill:
                this.isBoth = true;
                break;
        }
    }

    applyClipboardAction(actionType: string): void {
        this.clipboardService.applyAction(actionType);
    }

    selectAllPixels(): void {
        this.selectionService.selectAllPixels();
    }

    @HostListener('window:keydown', ['$event'])
    handleKeyDown(event: KeyboardEvent): void {
        this.isAltKeyPressed = event.altKey;
    }

    @HostListener('window:keyup', ['$event'])
    handleKeyUp(event: KeyboardEvent): void {
        this.isAltKeyPressed = event.altKey;
    }

    @HostListener('window:wheel', ['$event'])
    onMousewheel(event: WheelEvent): void {
        if (this.isStampEnabled) {
            const angleToAdd: number = this.isAltKeyPressed ? 1 : ANGLE_INCREMENT_WHEEL;
            if (event.deltaY > 0) {
                this.stampAngle = Math.min(this.stampAngle + angleToAdd, MAX_ANGLE);
            } else {
                this.stampAngle = Math.max(this.stampAngle - angleToAdd, -MAX_ANGLE);
            }
        }
    }
}
