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
  isActiveListLayer = false;
  activeEventFull = false;
  isActiveLive = false;
  constructor(
    private sharedService: SharedService,
    private router : Router
  ) { }
  ngOnInit(): void {
    this.isActiveLive = true;
    this.sharedService.currentPageLive.subscribe(x=> {
      this.PageLive = x;
      if(this.PageLive === this.appConst.LivePage){
        this.isActiveLive = true;
        this.activeEventFull = false;
        this.isActiveListLayer = false;
      }
    }
    );
  }

  openListLayer() {
    let flagLayer = false;
    const url = this.router.url;
    this.isActiveListLayer = !this.isActiveListLayer;
    if(url === '/live-monitoring'){
      this.sharedService.currentShowLayerComp.subscribe(flag =>{
         flagLayer = flag;
      })
      if(flagLayer){
        this.sharedService.ChangeShowLayerComp(false);
        this.isActiveLive = true;
      }else{
        this.sharedService.ChangeShowLayerComp(true);
        this.sharedService.setEventActiveFull(false);
        this.isActiveLive = false;
        this.activeEventFull = false;
      } 
    }
  }

  pathDirect(){
    this.isActiveLive = true;
    const url = this.router.url;
    if(url === '/live-monitoring'){
      this.isActiveLive = true;
      this.isActiveListLayer = false;
      this.activeEventFull = false;
      this.sharedService.setEventActiveFull(false);
      this.sharedService.ChangeShowLayerComp(this.isActiveListLayer);
    }
  }

  openLastEvent(){
    this.activeEventFull = !this.activeEventFull;
    this.sharedService.setEventActiveFull(this.activeEventFull);
    if(this.activeEventFull){
      this.isActiveLive = false;
      this.isActiveListLayer = false;
      this.sharedService.ChangeShowLayerComp(false);
    }else{
      this.isActiveLive = true;
    }
  }

  checkMenuShow(no:number):boolean{
    return this.appConst.PageShowSideAll[this.PageLive].includes(no)
  }




}
