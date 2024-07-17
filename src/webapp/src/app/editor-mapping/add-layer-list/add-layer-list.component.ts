import { Component } from '@angular/core';
import { SharedService } from '../../../services/shared.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InsertLayer } from '../../../models/geo.model';
import { GeoServerService } from '../../../services/geoserver.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-layer-list',
  templateUrl: './add-layer-list.component.html',
  styleUrl: './add-layer-list.component.css'
})
export class AddLayerListComponent {
  addLayerForm!: FormGroup;
  constructor(private sharedService: SharedService, private fb: FormBuilder, private geoService: GeoServerService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.addLayerForm = this.fb.group({
      layerName: ['', Validators.required],
      description: [''],//, Validators.required
      secretLevel: ['Normal'],//, Validators.required
      layerType: ['', Validators.required],
      layerTypeDetail: ['Standard POI'],
      dynamic: ['Dinamic']
    });
    this.addLayerForm.controls['secretLevel'].disable();
    this.addLayerForm.controls['dynamic'].disable();
    this.addLayerForm.controls['layerTypeDetail'].disable();
  }

  onLayerTypeChange(value: string): void {
    this.addLayerForm.controls['layerType'].setValue(value);
    console.log('Layer Type changed to:', value);

  }
  onSubmit() {
    if (this.addLayerForm.valid) {
      console.log('Form Value:', this.addLayerForm.value);
      const response = new InsertLayer()
      response.workspace = 'gis';
      response.dbName = 'gis_db';
      response.layerName = this.addLayerForm.controls['layerName'].value;
      response.description = this.addLayerForm.controls['description'].value;
      response.attr.push({
        'name': 'the_geom',
        'isNull': false,
        'type': this.addLayerForm.controls['layerType'].value
      })

      response.attr.push({
        'name': 'name',
        'isNull': true,
        'type': ''
      })

      response.attr.push({
        'name': 'vector_type',
        'isNull': true,
        'type': ''
      })

      let payload = this.geoService.xmlInsertLayerToPayload(response);
      console.log('payload :', payload);

      this.geoService.InsertLayer(payload, response.workspace, response.dbName).subscribe(res => {
        this.toastr.success('Created layer success!', 'Success');
        this.onClose();
      }, err => {
        this.toastr.error(err.message, 'Error');
        this.onClose();
      });
    } else {
      // console.error('Form is invalid');
      console.log('Form Errors:', this.addLayerForm.errors);
      console.log('Controls State:', this.addLayerForm.controls);
      // alert('Form is invalid');
    }
    // Handle form submission
    // console.log('onSubmit');

    // this.sharedService.setFlagLayerConf(true);
    
  }
  onClose() {
    this.sharedService.TurnOnOrOff(false);
  }
}
