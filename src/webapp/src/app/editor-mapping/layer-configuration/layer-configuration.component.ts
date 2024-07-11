import { Component } from '@angular/core';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'app-layer-configuration',
  templateUrl: './layer-configuration.component.html',
  styleUrl: './layer-configuration.component.css'
})
export class LayerConfigurationComponent {

  constructor(private sharedService : SharedService){}

  onSubmit() {
    // Handle form submission logic here
  }

  onCancel() {
    // Handle form cancel logic here
    this.sharedService.setFlagLayerConf(false);
    this.sharedService.TurnOnOrOff(true);
  }
}
