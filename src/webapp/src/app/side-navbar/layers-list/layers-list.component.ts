import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Layer } from '../../../models/layer.model';
import { GeoServerService } from '../../../services/geoserver.service';

@Component({
  selector: 'app-layers-list',
  templateUrl: './layers-list.component.html',
  styleUrl: './layers-list.component.css'
})
export class LayersListComponent {
  layers: Layer[] = [];
  constructor(public dialogRef: MatDialogRef<LayersListComponent>
    ,@Inject(MAT_DIALOG_DATA) public data: any,
    private geoService : GeoServerService
  ) {}

  ngOnInit(): void {
    this.layers = this.data.layers;
    // console.log(this.layers);
    this.layers.forEach(ele => {
      this.geoService.getAbstract(ele.name).subscribe(
        abstract => {
          ele.abs = abstract??''; // Assign the abstract to the 'abs' property of 'ele'
        },
        error => {
          console.error('Error fetching abstract:', error);
        }
      );
    });

    // console.log(this.layers);
    
    // 
  }


  closeDialog(): void {
    this.dialogRef.close();
  }
}
