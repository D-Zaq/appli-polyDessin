import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ColorModule } from '@app/modules/color.module';
import { NgImageSliderModule } from 'ng-image-slider';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app/app.component';
import { AttributeEditorComponent } from './components/attribute-editor/attribute-editors/attribute-editor.component';
import { DrawingComponent } from './components/drawing/drawing.component';
import { EditorComponent } from './components/editor/editor.component';
import { GridComponent } from './components/grid/grid.component';
import { MagnetismComponent } from './components/magnetism/magnetism.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import { CreateNewDrawingDialogComponent } from './components/sidebar/create-new-drawing-dialog/create-new-drawing-dialog.component';
import { ConfirmationDialogComponent } from './components/sidebar/drawings-carousel-dialog/confirmation-dialog/confirmation-dialog.component';
import { DrawingsCarouselDialogComponent } from './components/sidebar/drawings-carousel-dialog/drawings-carousel-dialog.component';
import { ExportDrawingDialogComponent } from './components/sidebar/export-drawing-dialog/export-drawing-dialog.component';
import { SaveDrawingDialogComponent } from './components/sidebar/save-drawing-dialog/save-drawing-dialog.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ZoomCanvasComponent } from './components/zoom-canvas/zoom-canvas.component';
import { MaterialModule } from './material.module';
import { ThreeJSHomeComponent } from './three-js-home/three-js-home.component';
@NgModule({
    declarations: [
        AppComponent,
        EditorComponent,
        SidebarComponent,
        DrawingComponent,
        MainPageComponent,
        CreateNewDrawingDialogComponent,
        AttributeEditorComponent,
        ExportDrawingDialogComponent,
        ZoomCanvasComponent,
        SaveDrawingDialogComponent,
        DrawingsCarouselDialogComponent,
        ConfirmationDialogComponent,
        GridComponent,
        MagnetismComponent,
        ThreeJSHomeComponent,
    ],
    imports: [BrowserModule, HttpClientModule, AppRoutingModule, BrowserAnimationsModule, MaterialModule, ColorModule, NgImageSliderModule],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
