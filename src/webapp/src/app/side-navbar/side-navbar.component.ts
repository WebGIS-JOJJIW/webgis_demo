import { Component } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SharedService } from '../../services/shared.service';
import { LayersListComponent } from './layers-list/layers-list.component';
import { GeoServerService } from '../../services/geoserver.service';
import { Layer } from '../../models/layer.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-side-navbar',
  templateUrl: './side-navbar.component.html',
  styleUrl: './side-navbar.component.css'
})
export class SideNavbarComponent {
  layers: Layer[] = [];

  constructor(
    private sharedService: SharedService,
    private router : Router
  ) { }

  async openListLayer() {
    // let flagPage = false;
    let flagLayer = false;
    const url = this.router.url;
    // this.sharedService.currentPageOn.subscribe(x => flagPage = x);
    // console.log('url',url);

    if(url === '/'){
      // console.log('now');
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
