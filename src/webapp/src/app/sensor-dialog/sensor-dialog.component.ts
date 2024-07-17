import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SharedService } from '../../services/shared.service';
import { NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MarkerDetailsData } from '../../models/sensor.model';

@Component({
  selector: 'app-sensor-dialog',
  templateUrl: './sensor-dialog.component.html',
  styleUrl: './sensor-dialog.component.css'
})
export class SensorDialogComponent implements OnInit, OnDestroy {
  // dialogMode = 'sensor';

  
  sensorData : MarkerDetailsData;
  private routerSubscription: Subscription | undefined;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: MarkerDetailsData,
    private dialog : MatDialog,
    public dialogRef: MatDialogRef<SensorDialogComponent>,
    private router: Router,
    private sharedService : SharedService
  ) {
    this.dialog.closeAll();
    // this.sharedService.TurnOnOrOff(false);
    this.sensorData =data;
    this.sharedService.updateSensorData(data);
    
    
  }

  ngOnInit(): void {

    this.routerSubscription = this.sharedService.currentSensorData.subscribe(data => {
      this.sensorData = data;
      // console.log(this.sensorData);
      
      // Update the dialog view with new data
    });

    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.dialog.closeAll();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}
export { MarkerDetailsData };

