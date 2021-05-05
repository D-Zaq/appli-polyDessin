import { Component } from '@angular/core';
import { Handle } from '@app/constants/handle';
import { MagnetismService } from '@app/services/magnetism/magnetism.service';

@Component({
    selector: 'app-magnetism-option',
    templateUrl: './magnetism.component.html',
    styleUrls: ['./magnetism.component.scss'],
})
export class MagnetismComponent {
    isTopLeft: boolean;
    isTopRight: boolean;
    isTop: boolean;
    isLeft: boolean;
    isRight: boolean;
    isBottomLeft: boolean;
    isBottom: boolean;
    isBottomRight: boolean;
    isCenterBox: boolean;
    choiceControlPoint: Handle;

    constructor(public magnetismService: MagnetismService) {
        this.choiceControlPoint = this.magnetismService.selectedControlPoint;
        this.selectControlPointRadio();
    }

    selectControlPointRadio(): void {
        this.isTopLeft = false;
        this.isTopRight = false;
        this.isTop = false;
        this.isLeft = false;
        this.isRight = false;
        this.isBottomLeft = false;
        this.isBottom = false;
        this.isBottomRight = false;
        this.isCenterBox = false;

        switch (this.magnetismService.selectedControlPoint) {
            case Handle.TopLeft:
                this.isTopLeft = true;
                break;
            case Handle.TopRight:
                this.isTopRight = true;
                break;
            case Handle.BottomLeft:
                this.isBottomLeft = true;
                break;
            case Handle.BottomRight:
                this.isBottomRight = true;
                break;
            case Handle.Top:
                this.isTop = true;
                break;
            case Handle.Left:
                this.isLeft = true;
                break;
            case Handle.Bottom:
                this.isBottom = true;
                break;
            case Handle.Right:
                this.isRight = true;
                break;
            case Handle.CenterBox:
                this.isCenterBox = true;
                break;
        }
    }

    radioControlPointHandler(event: string): void {
        switch (event) {
            case '1':
                this.choiceControlPoint = Handle.TopLeft;
                break;
            case '2':
                this.choiceControlPoint = Handle.TopRight;
                break;
            case '3':
                this.choiceControlPoint = Handle.BottomLeft;
                break;
            case '4':
                this.choiceControlPoint = Handle.BottomRight;
                break;
            case '5':
                this.choiceControlPoint = Handle.Top;
                break;
            case '6':
                this.choiceControlPoint = Handle.Left;
                break;
            case '7':
                this.choiceControlPoint = Handle.Bottom;
                break;
            case '8':
                this.choiceControlPoint = Handle.Right;
                break;
            case '9':
                this.choiceControlPoint = Handle.CenterBox;
                break;
        }
        this.magnetismService.selectedControlPoint = this.choiceControlPoint;
    }
}
