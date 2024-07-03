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
    private dialog: MatDialog,
    private sharedService: SharedService,
    private geoService: GeoServerService
  ) { }

  async openListLayer() {
    let flagPage = false;
    this.sharedService.currentPageOn.subscribe(x => flagPage = x);
    // console.log(this.sharedService.currentPageOn);

    if (flagPage) {
      this.geoService.getLayerListApi().subscribe((res: any) => {  // Type assertion here
        if (res) {
          this.layers = res.layers.layer
        .filter((layer: { name: string; }) => layer.name.startsWith('gis:'))
        .map((layer: { name: string; }) => ({
          ...layer,
          name: layer.name.replace('gis:', '')  // Remove 'gis:' from layer.name
        }));
          
          const dialogConfig = new MatDialogConfig();
          dialogConfig.height = '90%';
          dialogConfig.width = '450px';
          dialogConfig.position = {
            top: '110px',
            left: '80px'
          };
          dialogConfig.data = {
            layers: this.layers
          };
          dialogConfig.hasBackdrop = false;
          dialogConfig.panelClass = 'custom-modalbox';
  
          this.dialog.closeAll();
          this.dialog.open(LayersListComponent, dialogConfig);
        } else {
          console.error('Response is undefined or null.');
        }
      });
    }
  }


}
