import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SharedService } from '../../services/shared.service';
import { LayersListComponent } from './layers-list/layers-list.component';
import { GeoServerService } from '../../services/geoserver.service';
import { Layer } from '../../models/layer.model';

@Component({
  selector: 'app-side-navbar',
  templateUrl: './side-navbar.component.html',
  styleUrl: './side-navbar.component.css'
})
export class SideNavbarComponent {
  layers: Layer[] = [];

  constructor(
    private sharedService: SharedService
  ) { }

  async openListLayer() {
    let flagPage = false;
    let flagLayer = false;
    this.sharedService.currentPageOn.subscribe(x => flagPage = x);

    if (flagPage) {
      this.sharedService.currentShowLayerComp.subscribe(flag =>{
         flagLayer = flag;
      })

      if(flagLayer){
        this.sharedService.ChangeShowLayerComp(false);
      }else{
        this.sharedService.ChangeShowLayerComp(true);
      }
    }
  }


}
