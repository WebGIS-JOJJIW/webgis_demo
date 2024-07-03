import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-warning',
  templateUrl: './dialog-warning.component.html',
  styleUrl: './dialog-warning.component.css'
})
export class DialogWarningComponent {
  constructor(public dialogRef: MatDialogRef<DialogWarningComponent>) {}

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onYesClick(): void {
    this.dialogRef.close(true);
  }
}
