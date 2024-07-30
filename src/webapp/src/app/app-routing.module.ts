import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LiveMotionComponent } from './live-motion/live-motion.component';
import { DroneMotionComponent } from './drone-motion/drone-motion.component';
import { EditorMappingComponent } from './editor-mapping/editor-mapping.component';
import { LastestEventsComponent } from './lastest-events/lastest-events.component';

const routes: Routes = [ 
  {path: 'live-monitoring', component: LiveMotionComponent},
  {path: 'drone-patrol', component: DroneMotionComponent},
  {path: 'map-editor',   component: EditorMappingComponent},
  {path: 'lastest-events/:flag',   component: LastestEventsComponent},
  { path: '', redirectTo: '/live-monitoring', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
