import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LiveMotionComponent } from './live-motion/live-motion.component';
import { DroneMotionComponent } from './drone-motion/drone-motion.component';
import { EditorMappingComponent } from './editor-mapping/editor-mapping.component';
import { TopNavbarComponent } from './top-navbar/top-navbar.component';
import { SideNavbarComponent } from './side-navbar/side-navbar.component';
import { SensorDialogComponent } from './sensor-dialog/sensor-dialog.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { DrawToolbarComponent } from './editor-mapping/draw-toolbar/draw-toolbar.component';
import { DialogWarningComponent } from './dialog-warning/dialog-warning.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon'
import { HttpClientModule } from '@angular/common/http';
import { AddLayerComponent } from './editor-mapping/add-layer/add-layer.component';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { LayersListComponent } from './side-navbar/layers-list/layers-list.component';
import { LayersDisplayComponent } from './editor-mapping/layers-display/layers-display.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AddLayerListComponent } from './editor-mapping/add-layer-list/add-layer-list.component';
import { LayerConfigurationComponent } from './editor-mapping/layer-configuration/layer-configuration.component';
import { LastestEventsComponent } from './lastest-events/lastest-events.component';
import { ToastrModule } from 'ngx-toastr';
@NgModule({
  declarations: [
    AppComponent,
    LiveMotionComponent,
    DroneMotionComponent,
    EditorMappingComponent,
    TopNavbarComponent,
    SideNavbarComponent,
    SensorDialogComponent,
    DrawToolbarComponent,
    DialogWarningComponent,
    AddLayerComponent,
    LayersListComponent,
    LayersDisplayComponent,
    AddLayerListComponent,
    LayerConfigurationComponent,
    LastestEventsComponent
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    HttpClientModule,MatSelectModule,ReactiveFormsModule,MatFormFieldModule,MatRadioModule,MatCheckboxModule,
    DragDropModule,ToastrModule.forRoot({
      positionClass: 'toast-top-right'
    }),
    FormsModule
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
