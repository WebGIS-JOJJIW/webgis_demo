import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GeoServerService } from '../../../services/geoserver.service';
import { InsertLayer } from '../../../models/geomodel';

@Component({
  selector: 'app-add-layer',
  templateUrl: './add-layer.component.html',
  styleUrl: './add-layer.component.css'
})
export class AddLayerComponent {
  formGroup!: FormGroup;
  private proxy = ''  
  constructor(
    public dialogRef: MatDialogRef<AddLayerComponent>,
    private geoService: GeoServerService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.proxy = this.geoService.GetProxy();
    this.formGroup = this.fb.group({
      layerName: ['', Validators.required],
      description: [''],
      secretLevel: ['Normal'],
      layerType: ['Point'],
      dynamic: ['Dinamic'],
      poiType: ['standard-poi']
    });

    this.formGroup.controls['dynamic'].disable();
    this.formGroup.controls['poiType'].disable();
  }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  onSaveClick(): void {
    if (this.formGroup.valid) {
      // console.log(this.formGroup.value);
      // this.dialogRef.close(true);
      const response = new InsertLayer()
      response.workspace = 'gis';
      response.dbName = 'gis_db';
      response.layerName = this.formGroup.controls['layerName'].value;
      response.description = this.formGroup.controls['description'].value;
      response.attr.push({
        'name': this.formGroup.controls['layerName'].value,
        'isNull': false,
        'type': this.formGroup.controls['layerType'].value
      })

      let payload = this.geoService.xmlInsertLayerToPayload(response);
      console.log('payload :',payload);
      this.geoService.InsertLayer(payload,response.workspace,response.dbName).subscribe(res=>{
        console.log('res:', res);
      },err => {
        console.log('err', err);
      });

      // const url = `${this.proxy}/rest/workspaces/${response.workspace}/datastores/${response.dbName}/featuretypes/`
      // fetch(url, {
      //   mode: "no-cors",
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': 'Basic ' + btoa('admin:geoserver')
      //   },
      //   body: payload
      // })
      //   .then(res => {
      //     console.log(res);

      //     // console.log(re);
      //     // console.log(res);
      //   })
      //   .catch(error => console.error(`Error saving ${response.layerName} data to GeoServer:`, error));

    }
  }

  onChange(value: string): void {
    this.formGroup.controls['layerType'].setValue(value);
    console.log('Layer Type changed to:', value);
  }
}
