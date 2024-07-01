import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormControl, Validators } from '@angular/forms';
import { GeoServerService } from '../../../services/geoserver.service';
interface typeMap {
  name: string;
  desc: string;
}
@Component({
  selector: 'app-add-layer',
  templateUrl: './add-layer.component.html',
  styleUrl: './add-layer.component.css'
})
export class AddLayerComponent {
  [x: string]: any;
  typeMap: typeMap[] = [
    { name: 'POI', desc: 'Point' },
    { name: 'ROI', desc: 'Line String' },
    { name: 'POLYGON', desc: 'Polygon shape' },
  ];
  typeControl = new FormControl<typeMap | null>(null, Validators.required);
  selectFormControl = new FormControl('', Validators.required);
  constructor(public dialogRef: MatDialogRef<AddLayerComponent>,private geoService : GeoServerService) { }

  ngOnInit(): void {
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onSaveClick(): void {
    this.dialogRef.close(true);
  }
}
