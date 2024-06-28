import { Component } from '@angular/core';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'app-draw-toolbar',
  templateUrl: './draw-toolbar.component.html',
  styleUrl: './draw-toolbar.component.css'
})
export class DrawToolbarComponent {
  constructor(private sharedService: SharedService,){

  }
  inputSearch =""

  changeMode(mode: 'draw_polygon' |'draw_line_string'|'draw_point'){
    this.sharedService.changeMode(mode);
  }

}
