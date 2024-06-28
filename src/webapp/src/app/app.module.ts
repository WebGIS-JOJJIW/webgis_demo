import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LiveMotionComponent } from './live-motion/live-motion.component';
import { TableComponent } from './SharedComponent/table/table.component';
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
@NgModule({
  declarations: [
    AppComponent,
    LiveMotionComponent,
    TableComponent,
    DroneMotionComponent,
    EditorMappingComponent,
    TopNavbarComponent,
    SideNavbarComponent,
    SensorDialogComponent,
    DrawToolbarComponent,
    DialogWarningComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    HttpClientModule
  ],
  providers: [
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
