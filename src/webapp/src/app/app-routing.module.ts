import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LiveMotionComponent } from './live-motion/live-motion.component';
import { DroneMotionComponent } from './drone-motion/drone-motion.component';
import { EditorMappingComponent } from './editor-mapping/editor-mapping.component';
import { LastestEventsComponent } from './lastest-events/lastest-events.component';

const routes: Routes = [ 
  {path: '', component: LiveMotionComponent},
  {path: 'drone-patrol', component: DroneMotionComponent},
  {path: 'map-editor',   component: EditorMappingComponent},
  {path: 'lastest-events/:flag',   component: LastestEventsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
