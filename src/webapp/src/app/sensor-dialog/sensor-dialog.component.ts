import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { SharedService } from '../../services/shared.service';

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
    @Inject(MAT_DIALOG_DATA) public data: MarkerDetailsData,
    private dialog : MatDialog,
    private sharedService:SharedService
  ) {
    this.dialog.closeAll();
    this.sharedService.TurnOnOrOff(false);
  }
}
