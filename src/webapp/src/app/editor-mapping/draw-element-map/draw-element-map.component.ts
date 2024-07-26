import { Component, OnInit } from '@angular/core';
import { Layer, Layer_List } from '../../../models/layer.model';
import { SharedService } from '../../../services/shared.service';
import { GeoServerService } from '../../../services/geoserver.service';

@Component({
  selector: 'app-draw-element-map',
  templateUrl: './draw-element-map.component.html',
  styleUrl: './draw-element-map.component.css'
})
export class DrawElementMapComponent implements OnInit {

  layersList: Layer[] = [];
  layersData: Layer_List[] = [];
  layerOld = new Layer_List;
  selectedLayer: any = null; // Keeps track of the selected layer
  constructor(private sharedService: SharedService, private geoService: GeoServerService) { }

  ngOnInit(): void {
    this.setupSubscriptions();

  }

  setupSubscriptions() {
    let flagActive = false;
    this.sharedService.currentActiveLayerEditor.subscribe(x => { flagActive = x });
    if (flagActive) {
      this.geoService.getLayerListApi().subscribe(async res => {
        this.layersList = res.layers.layer.filter((layer: { name: string; }) => layer.name.startsWith('gis:') && (!layer.name.includes('drone_images')  && !layer.name.includes('sensors'))).map((layer => ({
          ...layer,
          name: layer.name.replace('gis:', ''),  // Remove 'gis:' from layer.name
        })));
        // console.log(res);
        
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
              let description = '';
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

        this.layersList.filter(x => x.type === 'VECTOR').forEach(ele => {
          let type = '';
          let subtype = '';
          if (ele.vector_type != 'NO_LAYER_TYPE') {
            if (ele.vector_type === 'STANDARD_POI') {
              type = 'Standard POI';
              subtype = 'Static Point'
            } else if (ele.vector_type === 'CAMERA_POI') {
              type = 'Camera POI';
              subtype = 'Static Point'
            } else if (ele.vector_type === 'COMMUNICATION_POI') {
              type = 'Communication POI';
              subtype = 'Static Point'
            } else if (ele.vector_type === 'POLYGON') {
              type = 'Polygon';
              subtype = 'Polygon'
            } else if (ele.vector_type === 'POLYLINE') {
              type = 'Polyline';
              subtype = 'Polyline'
            }

            this.layersData.push({
              name: ele.name.toUpperCase(),
              zone: 'zone001',
              originalName: ele.name,
              type: type,
              typeID:ele.vector_type,
              subtype: subtype
            })
          }

        });
      });
    }
    this.sharedService.currentLayer.subscribe(x=> this.layerOld = x);
  }

  setEditorMap(layer : Layer_List){
    if(layer != this.layerOld){
      if(layer.typeID.endsWith('POI')){
        this.sharedService.changeMode('draw_point');
        this.sharedService.setIsMode('draw_point');
      }else if(layer.typeID === 'POLYGON'){
        this.sharedService.changeMode('draw_polygon');
        this.sharedService.setIsMode('draw_polygon');
      }else if (layer.typeID === 'POLYLINE'){
        this.sharedService.changeMode('draw_line_string');
        this.sharedService.setIsMode('draw_line_string');
      }
      this.sharedService.setLayer(layer);
    }
  }

  selectLayer(layer: Layer_List): void {
    this.selectedLayer = layer;
    this.setEditorMap(layer);
  }

  deselectLayer(event: MouseEvent): void {
    event.stopPropagation(); // Prevents the row click from firing
    this.selectedLayer = null;
    this.layerOld = new Layer_List;
    this.selectLayer(new Layer_List);
  }

}
