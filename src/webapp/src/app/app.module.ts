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

@NgModule({
  declarations: [
    AppComponent,
    LiveMotionComponent,
    TableComponent,
    DroneMotionComponent,
    EditorMappingComponent,
    TopNavbarComponent,
    SideNavbarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
