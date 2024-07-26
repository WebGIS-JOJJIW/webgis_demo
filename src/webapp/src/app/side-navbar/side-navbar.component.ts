import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SharedService } from '../../services/shared.service';
import { LayersListComponent } from './layers-list/layers-list.component';
import { GeoServerService } from '../../services/geoserver.service';
import { Layer } from '../../models/layer.model';
import { Router } from '@angular/router';
import { AppConst } from '../../models/AppConst';

@Component({
  selector: 'app-side-navbar',
  templateUrl: './side-navbar.component.html',
  styleUrl: './side-navbar.component.css'
})
export class SideNavbarComponent implements OnInit{
  layers: Layer[] = [];
  PageLive: string = '';
  appConst = AppConst;
  constructor(
    private sharedService: SharedService,
    private router : Router
  ) { }
  ngOnInit(): void {
    this.sharedService.currentPageLive.subscribe(x=> {
      this.PageLive = x;
    }
      
    );
  }

  openListLayer() {
    let flagLayer = false;
    const url = this.router.url;

    if(url === '/live-monitoring'){
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

  openLastEvent(){
    this.router.navigate(['/lastest-events', true]);
  }

  checkMenuShow(no:number):boolean{
    // console.log(this.appConst.PageShowSideAll[this.PageLive]);
    return this.appConst.PageShowSideAll[this.PageLive].includes(no)
  }




}
