import { Component } from '@angular/core';
import { SharedService } from '../../../services/shared.service';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-draw-toolbar',
  templateUrl: './draw-toolbar.component.html',
  styleUrls: ['./draw-toolbar.component.css']
})
export class DrawToolbarComponent {
  isAddLayerDisabled: boolean = false;
  isPoint : boolean =true;
  isPolygon : boolean =true;
  isPolyline : boolean =true;

  constructor(private sharedService: SharedService, private dialog: MatDialog) {}
  
  inputSearch = "";

  changeMode(mode: 'draw_polygon' | 'draw_line_string' | 'draw_point') {
    this.sharedService.changeMode(mode);
  }

  onClickAddLayer() {
    this.sharedService.TurnOnOrOff(true);
    this.sharedService.setFlagLayerConf(false);
  }
}
