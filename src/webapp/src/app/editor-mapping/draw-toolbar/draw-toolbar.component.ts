import { Component } from '@angular/core';
import { SharedService } from '../../../services/shared.service';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { AddLayerComponent } from '../add-layer/add-layer.component';

@Component({
  selector: 'app-draw-toolbar',
  templateUrl: './draw-toolbar.component.html',
  styleUrls: ['./draw-toolbar.component.css']
})
export class DrawToolbarComponent {
  
  constructor(private sharedService: SharedService, private dialog: MatDialog) {}
  
  inputSearch = "";
  dialogRef: MatDialogRef<AddLayerComponent> | null = null;

  changeMode(mode: 'draw_polygon' | 'draw_line_string' | 'draw_point') {
    this.sharedService.changeMode(mode);
  }

  onClickAddLayer() {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    } else {
      const dialogConfig = new MatDialogConfig();
      dialogConfig.height = '90%';
      dialogConfig.width = '450px';
      dialogConfig.position = {
        top: '110px',
        right: '10px'
      };
      dialogConfig.hasBackdrop = false;
      dialogConfig.panelClass = 'custom-modalbox';

      this.dialogRef = this.dialog.open(AddLayerComponent, dialogConfig);

      this.dialogRef.afterClosed().subscribe(() => {
        this.dialogRef = null;
      });
    }
  }
}
