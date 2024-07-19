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
  standard_list:Layer[] = [];
  camera_list:Layer[] = [];
  communication_list:Layer[] = [];
  polygon_list:Layer[] = [];
  polyline_list:Layer[] = [];
  raster_list:Layer[] = [];


  constructor(private geoService: GeoServerService, private sharedService: SharedService) { }
  sections = {
    vectors: true,
    rasters: true
  };

  selectedLayers: string[] = [];


  ngOnInit(): void {
    let flagPage = false;
    let flagActive = false;
    this.sharedService.currentPageOn.subscribe(x => { flagPage = x });
    this.sharedService.currentShowLayerComp.subscribe(x => { flagActive = x });
    if (flagActive) {
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
              this.layersList[index].vector_type = description.toUpperCase();
            }
          })
        );
        // Wait for all promises in the second loop to resolve
        await Promise.all(secondLoopPromises);

        //Filter List of Type 
        this.standard_list = this.layersList.filter(x=> x.vector_type === 'STANDARD_POI')
        this.camera_list = this.layersList.filter(x=> x.vector_type === 'CAMERA_POI')
        this.communication_list =this.layersList.filter(x=> x.vector_type === 'COMMUNICATION_POI')
        this.polygon_list = this.layersList.filter(x=> x.vector_type === 'POLYGON')
        this.polyline_list = this.layersList.filter(x=> x.vector_type === 'POLYLINE')
        this.raster_list = this.layersList.filter(x=> x.type === 'RASTER')
        // console.log(this.standard_list);
        // console.log(this.camera_list);
        // console.log(this.communication_list);
        // console.log(this.polygon_list);
        // console.log(this.layersList.filter(x=>x.type != 'RASTER' && x.vector_type != 'NO_LAYER_TYPE'));
        
        // console.log(this.polyline_list);
        // console.log(this.raster_list);
        
        
      });
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.selectedLayers, event.previousIndex, event.currentIndex);
  }

  toggleSection(section: 'vectors' | 'rasters') {
    this.sections[section] = !this.sections[section];
  }

  onCheckboxChange(event: any, layerName: string) {
    if (event.checked) {
      this.selectedLayers.push(layerName);
      // this.sharedService.setLayersDisplay(this.selectedLayers);
    } else {
      this.removeLayer(layerName);
    }
  }

  removeLayer(layerName: string) {
    this.selectedLayers = this.selectedLayers.filter(layer => layer !== layerName);
    this.uncheckLayer(layerName);
  }

  uncheckLayer(layerName: string) {
    // Assuming each layer list contains objects with a 'name' property
    this.standard_list.forEach(item => {
      if (item.name === layerName) item.checked = false;
    });
    this.camera_list.forEach(item => {
      if (item.name === layerName) item.checked = false;
    });
    this.communication_list.forEach(item => {
      if (item.name === layerName) item.checked = false;
    });
    this.polygon_list.forEach(item => {
      if (item.name === layerName) item.checked = false;
    });
    this.polyline_list.forEach(item => {
      if (item.name === layerName) item.checked = false;
    });
    this.raster_list.forEach(item => {
      if (item.name === layerName) item.checked = false;
    });
  }

  isLayerSelected(layerName: string): boolean {
    return this.selectedLayers.includes(layerName);
  }

  onSaveChange(){
    this.sharedService.setLayersDisplay(this.selectedLayers);
    this.sharedService.ChangeShowLayerComp(false);
    this.sharedService.onSaveChangeLayer(true);
  }

  onCancel(){
    this.sharedService.setLayersDisplay([]);
    this.sharedService.ChangeShowLayerComp(false);
    this.sharedService.onSaveChangeLayer(false);
  }
}
