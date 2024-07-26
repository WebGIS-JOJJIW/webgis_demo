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
  private mode = 'draw_point';
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
    // this.initializeMap();
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
  }

  private initializeDraw(): void {
    this.draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        point: true,
        trash: true
      },
      defaultMode: this.mode
    });

    (this.map as any).addControl(this.draw as any);
    this.map.on('draw.create', this.onDrawCreate.bind(this));
    this.map.on('draw.update', this.onDrawUpdate.bind(this));
    this.map.on('draw.delete', this.onDrawDelete.bind(this));
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
            this.addLayerToMap(index, 'circle', 'circle-color', 6);
          } else {
            this.addLayerToMap(index, 'circle', 'circle-color', 3);
          }
          this.addLayerToMap(index, 'line', 'line-color', 2);
        })
        .catch(error => console.error('Error fetching WFS data:', error));
    }
  }

  private addLayerToMap(index: string, type: 'fill' | 'circle' | 'line', colorProperty: string, opacityOrRadius: number): void {
    const paint: { [key: string]: any } = {};
    paint[colorProperty] = ['get', 'color'];

    if (this.mode == 'draw_point') {
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
  private cancelDrawing(): void {
    this.draw.deleteAll();
  }

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
    if (event.key === 'Escape') {
      this.cancelDrawing();
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
  }
}
