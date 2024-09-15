import { Component, Input, input, OnInit } from '@angular/core';
import { SharedService } from '../../../services/shared.service';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-draw-toolbar',
  templateUrl: './draw-toolbar.component.html',
  styleUrls: ['./draw-toolbar.component.css']
})
export class DrawToolbarComponent implements OnInit {
  @Input() pageLive: string = '';
  isAddLayerDisabled: boolean = false;
  isPoint: boolean = true;
  isPolygon: boolean = true;
  isPolyline: boolean = true;
  datetimeValue: string = '';
  activeAllowDraw:boolean=true;

  constructor(private sharedService: SharedService) { }
  ngOnInit(): void {
    this.setSubscriptions();
  }
  setSubscriptions() {
    this.sharedService.currentIsPoint.subscribe(x => this.isPoint = !x);
    this.sharedService.currentIsPolygon.subscribe(x => this.isPolygon = !x);
    this.sharedService.currentIsPolyline.subscribe(x => this.isPolyline = !x);
    this.sharedService.currentActiveEdit.subscribe(x => {
      this.isAddLayerDisabled = x;
      if (x) {this.sharedService.TurnOnOrOff(false);}
    });
    this.sharedService.currentActiveAllowDraw.subscribe(x=>this.activeAllowDraw=x);
  }

  inputSearch = "";
  changeMode(mode: 'draw_polygon' | 'draw_line_string' | 'draw_point' | 'draw_shape_polygon') {
    // console.log(mode);
    
    this.sharedService.changeMode(mode);
    this.sharedService.setActiveAllowDraw(true); 
  }

  onClickAddLayer() {
    this.sharedService.TurnOnOrOff(true);
    this.sharedService.setFlagLayerConf(false);
  }
}
