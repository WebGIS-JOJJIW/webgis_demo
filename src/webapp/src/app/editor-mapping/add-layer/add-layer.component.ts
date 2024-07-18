import { Component } from '@angular/core';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-layer',
  templateUrl: './add-layer.component.html',
  styleUrls: ['./add-layer.component.css']
})
export class AddLayerComponent {
  constructor(private snackBarRef: MatSnackBarRef<AddLayerComponent>) {}

  dismiss() {
    this.snackBarRef.dismiss();
  }
}
