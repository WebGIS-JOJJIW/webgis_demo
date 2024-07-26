import { Component, OnInit, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import maplibregl from 'maplibre-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { SharedService } from '../../services/shared.service';
import { GeoServerService } from '../../services/geoserver.service';
import { Layer_List } from '../../models/layer.model';

@Component({
  selector: 'app-editor-mapping',
  templateUrl: './editor-mapping.component.html',
  styleUrls: ['./editor-mapping.component.css']
})

export class EditorMappingComponent implements OnInit {
  private map!: maplibregl.Map;
  private draw!: MapboxDraw;
  private mode = '';
  showAddLayer = false;
  showLayerConf = false;
  private layer!: Layer_List;
  private proxy = '';
  private unsavedFeatures: any[] = [];

  constructor(
    public dialog: MatDialog,
    private sharedService: SharedService,
    private geoServerService: GeoServerService
  ) { }

  ngOnInit(): void {
    this.proxy = this.geoServerService.GetProxy();
    this.subscribeToModeChanges();
    this.sharedService.currentPageOn.subscribe(x => this.showAddLayer = x);
    this.sharedService.currentLayerConf.subscribe(x => this.showLayerConf = x);
    this.sharedService.setActiveLayerEditor(true);
  }

  //#region Initialization
  private initializeMap(): void {
    this.map = new maplibregl.Map({
      container: 'map',
      style: 'https://api.maptiler.com/maps/b9ce2a02-280d-4a34-a002-37f946992dfa/style.json?key=NRZzdXmGDnNvgNaaF4Ic',
      center: [-74.3100039, 40.697538],
      zoom: 2,
    });

    this.map.addControl(new maplibregl.NavigationControl(), 'bottom-right');

    this.map.on('load', () => {
      this.setMultiLayersOnMap();
      this.addCustomImages();
      this.initializeDraw();
    });

    this.map.on('click', (event) => {
      if (this.mode === 'draw_point') {
        this.addPointAtClick(event);
      }
    });
  }

  private initializeDraw(): void {
    if (this.mode != '' && this.mode != 'draw_point') {
      this.draw = new MapboxDraw({
        displayControlsDefault: false,
        // controls: {
        //   point: true,
        //   trash: true
        // },
        defaultMode: this.mode
      });

      (this.map as any).addControl(this.draw as any);
      this.map.on('draw.create', this.onDrawCreate.bind(this));
      this.map.on('draw.update', this.onDrawUpdate.bind(this));
      this.map.on('draw.delete', this.onDrawDelete.bind(this));
    }

  }

  private subscribeToModeChanges(): void {
    this.sharedService.currentMode.subscribe(mode => {
      if (mode != this.mode) {
        this.mode = mode;
      }
    });

    this.sharedService.currentLayer.subscribe(x => {
      this.layer = x;
      this.initializeMap();
    });
  }
  //#endregion

  //#region Draw Events
  private onDrawCreate(event: any): void {
    this.unsavedFeatures.push(event.features[0]);
  }

  private onDrawUpdate(event: any): void {
    if (!event || !event.features) {
      console.error('Draw update event is invalid');
      return;
    }
    console.log('Draw update:', event);
  }

  private onDrawDelete(event: any): void {
    this.unsavedFeatures = this.unsavedFeatures.filter(f => !event.features.some((ef: any) => ef.id === f.id));
  }
  //#endregion

  //#region Map Layers
  private setMultiLayersOnMap(): void {
    var wrk = 'gis';
    var ly = this.layer.originalName;

    if (this.layer.name != '') {
      const wfsUrl = `${this.proxy}/${wrk}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${ly}&outputFormat=application/json`;
      const index = `${wrk}-${ly}`;

      fetch(wfsUrl)
        .then(response => response.json())
        .then(data => {
          data.features.forEach((feature: any) => {
            feature.properties.color = this.sharedService.getRandomColor();
          });

          this.map.addSource(`wfs-layer-${index}`, {
            type: 'geojson',
            data: data
          });

          if (this.mode == 'draw_polygon') {
            this.addLayerToMap(index, 'fill', 'fill-color', 0.5);
          }

          if (this.mode == 'draw_point') {
            this.addLayerToMap(index, 'point', 'circle-color', 6);
          } else {
            this.addLayerToMap(index, 'circle', 'circle-color', 3);
          }
          this.addLayerToMap(index, 'line', 'line-color', 2);
        })
        .catch(error => console.error('Error fetching WFS data:', error));
    }
  }

  private addLayerToMap(index: string, type: 'fill' | 'circle' | 'line' | 'symbol' | 'point', colorProperty: string, opacityOrRadius: number): void {
    const paint: { [key: string]: any } = {};
    paint[colorProperty] = ['get', 'color'];

    if (type === 'symbol') {
      this.map.addLayer({
        'id': `wfs-laye-${type}-${index}`,
        type: 'symbol',
        'source': `wfs-layer-${index}`,
        layout: {
          'icon-image': 'new-marker',
          'icon-size': 1.5,
          'text-field': '{title}',
          'text-offset': [0, 1.25],
          'text-anchor': 'top'
        }
      });
    }
    else if (type === 'point') {
      this.map.addLayer({
        'id': `wfs-laye-${type}-${index}`,
        type: 'symbol',
        'source': `wfs-layer-${index}`,
        layout: {
          'icon-image': 'custom-marker',
          'icon-size': 1.5,
          'text-field': '{title}',
          'text-offset': [0, 1.25],
          'text-anchor': 'top'
        }
      });
    } else {
      // Handle other types as before
      if (type === 'fill') {
        paint['fill-opacity'] = opacityOrRadius;
        this.map.addLayer({
          'id': `wfs-laye-${type}-${index}`,
          'type': 'fill',
          'source': `wfs-layer-${index}`,
          paint: paint
        });
      } else if (type === 'circle') {
        paint['circle-radius'] = opacityOrRadius;
        this.map.addLayer({
          'id': `wfs-laye-${type}-${index}`,
          'type': 'circle',
          'source': `wfs-layer-${index}`,
          paint: paint
        });
      } else if (type === 'line') {
        paint['line-width'] = opacityOrRadius;
        this.map.addLayer({
          'id': `wfs-laye-${type}-${index}`,
          'type': 'line',
          'source': `wfs-layer-${index}`,
          paint: paint
        });
      }
    }
  }
  //#endregion

  //#region Save Features
  saveFeatures(): void {
    if (this.unsavedFeatures.length > 0) {
      const features = this.unsavedFeatures;
      this.unsavedFeatures = [];
      const data = {
        type: 'FeatureCollection',
        features: features
      };
      // Handle saving `data` to your API or GeoServer
    }
  }
  //#endregion

  //#region Helpers
  // private cancelDrawing(): void {
  //   this.draw.deleteAll();
  // }

  resetMap(): void {
    const layers = this.map.getStyle().layers;
    if (layers) {
      layers.forEach(layer => {
        if (layer.id.startsWith('wfs-layer')) {
          this.map.removeLayer(layer.id);
        }
      });
    }

    const sources = this.map.getStyle().sources;
    for (const sourceId in sources) {
      if (sourceId.startsWith('wfs-layer')) {
        this.map.removeSource(sourceId);
      }
    }
  }
  //#endregion

  //#region Keyboard Events
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    // console.log(event); 
     if (event.key === 'Backspace') {
      this.deleteSelectedFeature();
    }
  }
  //#endregion

  addCustomImages(): void {
    const imgUrl = 'assets/img/marker_point.png';
    const img = new Image(30, 30);
    img.onload = () => {
      if (!this.map.hasImage('custom-marker')) {
        this.map.addImage('custom-marker', img);
      }
    };
    img.src = imgUrl;

    const imgUrl2 = 'assets/img/marker.png';
    const img2 = new Image(30, 30);
    img2.onload = () => {
      if (!this.map.hasImage('new-marker')) {
        this.map.addImage('new-marker', img2);
      }
    };
    img2.src = imgUrl2;
  }

  /////////////////////////////////////////////////////////// new open ai //////////////////////////////////////////////////////////////////////////////////////
  private addPointAtClick(event: maplibregl.MapMouseEvent): void {
    const lngLat = event.lngLat;
    const clickPoint: [number, number] = [lngLat.lng, lngLat.lat];
    const minDistance = 200; // Minimum distance in kilometers to prevent adding points (adjust as needed)
  
    // Retrieve the source
    const source = this.map.getSource(`wfs-layer-${this.layer.originalName}`) as maplibregl.GeoJSONSource;
  
    if (source) {
      const data = source._data as GeoJSON.FeatureCollection<GeoJSON.Geometry>;
      let isTooClose = false;
  
      // Check if the click location is too close to any existing features
      for (const feature of data.features) {
        if (feature.geometry.type === 'Point') {
          const coordinates = feature.geometry.coordinates;
  
          if (coordinates.length === 2) {
            const featurePoint: [number, number] = coordinates as [number, number];
            const distance = this.calculateDistance(clickPoint, featurePoint);
            // console.log(distance);
            
            if (distance < minDistance) {
              isTooClose = true;
              break;
            }
          } else {
            console.error('Feature coordinates are not in the expected format.');
          }
        }
      }  
      
      if (!isTooClose) {
        // Create a new feature with the clicked coordinates
        const feature: GeoJSON.Feature<GeoJSON.Point> = {
          type: 'Feature',
          id: this.generateFeatureId(),
          geometry: {
            type: 'Point',
            coordinates: [lngLat.lng, lngLat.lat]
          },
          properties: {
            color: this.sharedService.getRandomColor(),
            title: 'New Point',
            id: this.generateFeatureId() // Generate a unique ID for the feature
          }
        };
  
        // Add the new feature to the data
        data.features.push(feature);
  
        // Update the source with the new data
        source.setData(data);
      } else {
        // console.log('Click location is too close to an existing marker.');
        this.selectFeatureAtClick(event);
      }
    } 
    else {
      // If the source does not exist, create it
      const feature: GeoJSON.Feature<GeoJSON.Point> = {
        type: 'Feature',
          id: this.generateFeatureId(),
          geometry: {
            type: 'Point',
            coordinates: [lngLat.lng, lngLat.lat]
          },
          properties: {
            color: this.sharedService.getRandomColor(),
            title: 'New Point',
            id: this.generateFeatureId() // Generate a unique ID for the feature
          }
        };
      this.map.addSource(`wfs-layer-${this.layer.originalName}`, {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [feature] // Initialize with the new feature
        }
      });
  
      // Add the appropriate layer if needed
      this.addLayerToMap(this.layer.originalName, 'symbol', 'icon-color', 1);
    }
  }

  private generateFeatureId(): string {
    return `feature-${Date.now()}`;
  }
  private selectedFeatureId: string | null = null;
  private deleteSelectedFeature(): void {
    // console.log(this.selectedFeatureId);
    
    if (this.selectedFeatureId) {
      // console.log(this.selectedFeatureId);
      
      const source = this.map.getSource(`wfs-layer-${this.layer.originalName}`) as maplibregl.GeoJSONSource;

      if (source) {
        // console.log(source);
        
        // Get the current data from the source
        const currentData = source._data as GeoJSON.FeatureCollection<GeoJSON.Geometry>;
        // Filter out the selected feature
        // console.log(currentData);
        
        const updatedFeatures = currentData.features.filter(feature => feature.id !== this.selectedFeatureId);
        // console.log(updatedFeatures);
        
        // Update the source with the new data
        source.setData({
          type: 'FeatureCollection',
          features: updatedFeatures
        });

        // Clear the selected feature
        this.selectedFeatureId = null;
      }
    }
  }

  private selectFeatureAtClick(event: maplibregl.MapMouseEvent): void {
    const features = this.map.queryRenderedFeatures(event.point);
    console.log(features);
    if (features.length > 0) {
      const feature = features[0];
      // Ensure feature.id is a string or null
      // console.log(feature.properties['id']);
      this.selectedFeatureId = feature.properties['id'] != undefined ? feature.properties['id'] : null;
      // console.log('Selected feature:', feature);
      // console.log('selectedFeatureId', this.selectedFeatureId);
    } else {
      this.selectedFeatureId = null;
    }
  }

  private calculateDistance(lngLat1: [number, number], lngLat2: [number, number]): number {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.degreesToRadians(lngLat2[1] - lngLat1[1]);
    const dLng = this.degreesToRadians(lngLat2[0] - lngLat1[0]);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.degreesToRadians(lngLat1[1])) * Math.cos(this.degreesToRadians(lngLat2[1])) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }
  
  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

}
