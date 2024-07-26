import { Component, Input, input, OnInit } from '@angular/core';
import { SharedService } from '../../../services/shared.service';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-draw-toolbar',
  templateUrl: './draw-toolbar.component.html',
  styleUrls: ['./draw-toolbar.component.css']
})
export class DrawToolbarComponent implements OnInit{
  @Input() pageLive : string = '';
  isAddLayerDisabled: boolean = false;
  isPoint : boolean =true;
  isPolygon : boolean =true;
  isPolyline : boolean =true;
  datetimeValue: string = '';

  constructor(private sharedService: SharedService) {}
  ngOnInit(): void {
    this.setSubscriptions();
  }
  setSubscriptions(){
    this.sharedService.currentIsPoint.subscribe(x=> this.isPoint = !x);
    this.sharedService.currentIsPolygon.subscribe(x=> this.isPolygon = !x);
    this.sharedService.currentIsPolyline.subscribe(x=> this.isPolyline = !x);
  }
  
  inputSearch = "";

  changeMode(mode: 'draw_polygon' | 'draw_line_string' | 'draw_point') {
    this.sharedService.changeMode(mode);
  }

  onClickAddLayer() {
    this.sharedService.TurnOnOrOff(true);
    this.sharedService.setFlagLayerConf(false);
  }
}
