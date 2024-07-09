import { Component, OnInit, OnDestroy } from '@angular/core';
import maplibregl, { Marker, NavigationControl } from 'maplibre-gl';
import { MarkerDetailsData, SensorDialogComponent } from '../sensor-dialog/sensor-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { SharedService } from '../../services/shared.service';
import { GeoServerService } from '../../services/geoserver.service';

@Component({
  selector: 'app-live-motion',
  templateUrl: './live-motion.component.html',
  styleUrl: './live-motion.component.css'
})
export class LiveMotionComponent implements OnInit, OnDestroy {
  constructor(private dialog: MatDialog, private sharedService: SharedService, private geoService: GeoServerService) {
    this.dialog.closeAll();
    this.sharedService.TurnOnOrOff(false);
  }
  private map!: maplibregl.Map;
  markers: Marker[] = [];
  activeFlag = false;
  layersId = [''];
  layersDisplay = ['']


  ngOnInit(): void {
    this.addCustomImages();

    this.map = new maplibregl.Map({
      container: 'map',
      style: 'https://api.maptiler.com/maps/b9ce2a02-280d-4a34-a002-37f946992dfa/style.json?key=NRZzdXmGDnNvgNaaF4Ic',
      center: [101.86863588113442, 14.174982274310366], // starting position [lng, lat]
      zoom: 3 // starting zoom
    });
    this.map.addControl(new NavigationControl({}), 'bottom-right')

    this.sharedService.currentLayersDisplay.subscribe(res => {
      if(this.layersDisplay.length > 0 && res.length == 0){
        this.removeLayersFromMap();
      }else{
        this.layersDisplay = res;
        this.showLayerDataOnMap(this.layersDisplay, 'VECTOR');
      }
      
      
    });
    
    this.sharedService.currentShowLayerComp.subscribe(flag => {
      if (flag != this.activeFlag) {
        this.activeFlag = flag
      }
    })
  }

  showLayerDataOnMap(layersName: Array<string>, type: 'VECTOR' | 'RASTER') {
    // console.log('showLayerDataOnMap : ', layersName.length);
    if (layersName.length > 0) {
      const filterGroup = document.getElementById('filter-group');
      if (!filterGroup) {
        console.error('Filter group element not found');
        return;
      }
  
      layersName.forEach(name => {
        let url = `${this.geoService.GetProxy()}`;
        if (type === 'VECTOR') {
          url += `/gis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${name}&outputFormat=application/json`;
        } else {
          // Add RASTER URL logic if needed
        }
  
        // console.log('url :', url);
  
        this.geoService.getLayerDetails(url).subscribe(
          data => {
            const layerId = `id-${name}`;
            this.layersId.push(layerId);
  
            this.map.addSource(layerId, {
              type: 'geojson',
              data: data
            });
  
            if (!this.map.getLayer(layerId)) {
              if (data.features[0].geometry.type === 'Point') {
                this.addPoint(layerId);
              } else {
                if (data.features[0].geometry.type === 'Polygon') {
                  this.addPolylineAndPolygon(layerId, 'fill', 'fill-color', 0.5);
                }
                this.addPolylineAndPolygon(layerId, 'circle', 'circle-color', 3);
                this.addPolylineAndPolygon(layerId, 'line', 'line-color', 2);
              }
  
              // Add checkbox and label elements for the layer
              const input = document.createElement('input');
              input.type = 'checkbox';
              input.id = layerId;
              input.checked = true;
              filterGroup.appendChild(input);
  
              const label = document.createElement('label');
              label.setAttribute('for', layerId);
              label.textContent = name;
              filterGroup.appendChild(label);
  
              input.addEventListener('change', (e) => {
                const target = e.target as HTMLInputElement;
                this.map.setLayoutProperty(
                  layerId,
                  'visibility',
                  target.checked ? 'visible' : 'none'
                );
              });
            }
          },
          error => {
            console.error('Error fetching places data', error);
          }
        );
      });
    }
  }


  addPoint(name: string) {
    this.map.addLayer({
      'id': name,
      type: 'symbol',
      'source': name,
      layout: {
        'icon-image': 'custom-marker', // Change this to your preferred marker icon
        'icon-size': 1.5,
        'text-field': '{title}',
        'text-offset': [0, 1.25],
        'text-anchor': 'top'
      }
    });

  }

  addPolylineAndPolygon(index: string, type: 'fill' | 'circle' | 'line', colorProperty: string, opacityOrRadius: number): void {
    const paint: { [key: string]: any } = {};
    paint[colorProperty] = ['get', 'color'];
    // console.log(type);
    if (type === 'fill') {
      paint['fill-opacity'] = opacityOrRadius;
      this.map.addLayer({
        'id': `${index}`,
        'type': 'fill',
        'source': `${index}`,
        paint: paint
      });
    } else if (type === 'circle') {
      paint['circle-radius'] = opacityOrRadius;
      this.map.addLayer({
        'id': `${index}`,
        'type': 'circle',
        'source': `${index}`,
        paint: paint
      });
    } else if (type === 'line') {
      paint['line-width'] = opacityOrRadius;
      this.map.addLayer({
        'id': `${index}`,
        'type': 'line',
        'source': `${index}`,
        paint: paint
      });
    }
  }

  openDialog(data: MarkerDetailsData): void {
    this.dialog.open(SensorDialogComponent, {
      width: '450px',
      height: '100%',
      data: data,
      position: { top: '80px', right: '0' }
    });
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
  //#endregion


  addCustomImages(): void {
    // Add your custom marker image
    const imgUrl = 'assets/img/marker_point.png'; // Replace with your image URL
    const img = new Image(30, 30); // Adjust the size as needed
    img.onload = () => {
      if (!this.map.hasImage('custom-marker')) {
        this.map.addImage('custom-marker', img);
      }
    };
    img.src = imgUrl;
  }


  removeLayersFromMap(): void {
    const filterGroup = document.getElementById('filter-group');
    if (!filterGroup) {
      console.error('Filter group element not found');
      return;
    }

    this.layersId.forEach(layerId => {
      if (this.map.getLayer(layerId)) {
        this.map.removeLayer(layerId);
      }
      if (this.map.getSource(layerId)) {
        this.map.removeSource(layerId);
      }

      const input = document.getElementById(layerId) as HTMLInputElement;
      const label = document.querySelector(`label[for='${layerId}']`);

      if (input) {
        filterGroup.removeChild(input);
      }
      if (label) {
        filterGroup.removeChild(label);
      }
    });

    // Clear the layersId array
    this.layersId = [];
  }

}
