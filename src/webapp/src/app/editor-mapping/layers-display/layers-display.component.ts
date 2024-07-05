import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core';
import { GeoServerService } from '../../../services/geoserver.service';
import { Layer } from '../../../models/layer.model';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'app-layers-display',
  templateUrl: './layers-display.component.html',
  styleUrl: './layers-display.component.css'
})
export class LayersDisplayComponent {
  layersList: Layer[] = [];

  constructor(private geoService: GeoServerService, private sharedService: SharedService) { }
  sections = {
    vectors: true,
    rasters: true
  };

  layers = [
    'SENSOR CAM1',
    'SENSOR COMM1',
    'Satellite Image'
  ];

  ngOnInit(): void {
    let flagPage = false;
    let flagActive = false;
    this.sharedService.currentPageOn.subscribe(x => { flagPage = x });
    this.sharedService.currentShowLayerComp.subscribe(x => { flagActive = x });
    if (flagPage && flagActive) {
      this.geoService.getLayerListApi().subscribe(async res => {
        this.layersList = res.layers.layer.filter((layer: { name: string; }) => layer.name.startsWith('gis:')).map((layer => ({
          ...layer,
          name: layer.name.replace('gis:', ''),  // Remove 'gis:' from layer.name
        }))); 

        // First loop get Type 'VECTOR' or 'RASTER' 
        const firstLoopPromises = this.layersList.map((element, index) =>
          this.geoService.getLayerDetails(element.href).toPromise().then(details1 => {
            this.layersList[index].type = details1.layer.type;
            this.layersList[index].href = details1.layer.resource.href;
          })
        );

        // Wait for all promises in the first loop to resolve
        await Promise.all(firstLoopPromises);

        // Second loop get Vector_type to list 
        const secondLoopPromises = this.layersList.map((element, index) =>
          this.geoService.getLayerDetails(element.href).toPromise().then(details2 => {
            
            if (element.type === 'VECTOR') {
              let description ='';
              try {
                const vectorTypeAttribute = details2.featureType.attributes.attribute.find((attr: any) => attr.name === 'vector_type');
                description = vectorTypeAttribute?.description?.['en-US'] || 'NO_LAYER_TYPE';
              } catch (error) {
                description = 'NO_LAYER_TYPE';
              }
              this.layersList[index].vector_type = description;
            }
          })
        );
        // Wait for all promises in the second loop to resolve
        await Promise.all(secondLoopPromises);
      });


    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.layers, event.previousIndex, event.currentIndex);
  }

  toggleSection(section: 'vectors' | 'rasters') {
    this.sections[section] = !this.sections[section];
  }
}
