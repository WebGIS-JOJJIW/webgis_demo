import { Component } from '@angular/core';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'app-add-layer-list',
  templateUrl: './add-layer-list.component.html',
  styleUrl: './add-layer-list.component.css'
})
export class AddLayerListComponent {
  constructor(private sharedService: SharedService){}

  onSubmit() {
    // Handle form submission
    // console.log('onSubmit');
    
    this.sharedService.setFlagLayerConf(true);
    this.onClose();
  }
  onClose(){
    this.sharedService.TurnOnOrOff(false);
  }
}
