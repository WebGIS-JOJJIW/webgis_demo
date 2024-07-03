import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LiveMotionComponent } from './live-motion/live-motion.component';
import { DroneMotionComponent } from './drone-motion/drone-motion.component';
import { EditorMappingComponent } from './editor-mapping/editor-mapping.component';

const routes: Routes = [ 
  {path: '', component: LiveMotionComponent},
  {path: 'drone-patrol', component: DroneMotionComponent},
  {path: 'map-editor',   component: EditorMappingComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
