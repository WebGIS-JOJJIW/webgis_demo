import { Component } from '@angular/core';
import { SharedService } from '../../../services/shared.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AddLayerComponent } from '../add-layer/add-layer.component';

@Component({
  selector: 'app-draw-toolbar',
  templateUrl: './draw-toolbar.component.html',
  styleUrl: './draw-toolbar.component.css'
})
export class DrawToolbarComponent {
  constructor(private sharedService: SharedService,private dialog :MatDialog){

  }
  inputSearch =""

  changeMode(mode: 'draw_polygon' |'draw_line_string'|'draw_point'){
    this.sharedService.changeMode(mode);
  }

  onClickAddlayer(){
    const dialogConfig = new MatDialogConfig();
    dialogConfig.height='90%';
    dialogConfig.width='450px';
    dialogConfig.position = {
      top: '110px',
      right: '10px'
    };  
    dialogConfig.hasBackdrop = false;
    dialogConfig.panelClass = 'custom-dialog-panel';
    const dialogRef = this.dialog.open(AddLayerComponent,dialogConfig);

    // dialogRef.afterClosed().subscribe(result => {
    //   if (result) {
        
    //   } else {
    //     console.log('User chose not to save.');
        
    //   }
    // });
  }
}
