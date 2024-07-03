import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface MarkerDetailsData {
  title: string;
  humanCount: number;
  vehicleCount: number;
  otherCount: number;
  healthStatus: string;
  healthTime: string;
  latestPhotoTime: string;
  latestPhoto: string;
  previousPhotos: { url: string; time: string; by: string; }[];
  coordinates: [number, number],
}

@Component({
  selector: 'app-sensor-dialog',
  templateUrl: './sensor-dialog.component.html',
  styleUrl: './sensor-dialog.component.css'
})
export class SensorDialogComponent {
  dialogMode = 'sensor';
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: MarkerDetailsData
  ) {}
}
