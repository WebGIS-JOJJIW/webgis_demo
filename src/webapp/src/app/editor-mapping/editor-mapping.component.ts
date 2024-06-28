import { Component, OnInit, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import maplibregl, { MapLayerMouseEvent, Marker, NavigationControl } from 'maplibre-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import { DialogWarningComponent } from '../dialog-warning/dialog-warning.component';
import { SharedService } from '../../services/shared.service';
import { GeoServerService } from '../../services/geoserver.service';

@Component({
  selector: 'app-editor-mapping',
  templateUrl: './editor-mapping.component.html',
  styleUrls: ['./editor-mapping.component.css']
})
export class EditorMappingComponent implements OnInit {
  private map!: maplibregl.Map;
  private draw!: MapboxDraw;
  private mode: string = 'draw_point';
  markers: Marker[] = [];

  constructor(
    public dialog: MatDialog,
    private sharedService: SharedService,
    private geoServerService: GeoServerService
  ) { }

  ngOnInit(): void {
    this.initializeMap();
    // this.initializeDraw();
    this.subscribeToModeChanges();
  }

  //#region Initialization
  private initializeMap(): void {
    this.map = new maplibregl.Map({
      container: 'map',
      style: 'https://api.maptiler.com/maps/b9ce2a02-280d-4a34-a002-37f946992dfa/style.json?key=NRZzdXmGDnNvgNaaF4Ic',
      center: [-74.3100039, 40.697538],
      zoom: 3
    });

    this.map.addControl(new NavigationControl(), 'bottom-right');
    this.setMultiLayersOnMap();
    this.map.on('load', () => {
      this.initializeDraw();
    });
  }

  private initializeDraw(): void {
    this.draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {},
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
        this.initializeMap();
      }

    });
    // console.log(this.mode);

  }
  //#endregion

  //#region Draw Events
  private onDrawCreate(event: any): void {
    this.saveFeatureToApi(event);
    this.logFeatureIds(event);
  }

  private onDrawUpdate(event: any): void {
    console.log('Draw update:', event);
  }

  private onDrawDelete(event: any): void {
    console.log('Draw delete:', event);
  }

  private logFeatureIds(event: any): void {
    const featureIds = event.features.map((feature: any) => feature.id);
    // console.log('Feature IDs:', featureIds);
  }
  //#endregion

  //#region Map Layers
  private setMultiLayersOnMap(): void {
    // const workspaceLayers = [['frvk', 'ply_frv'],['gis','test_polyline'],['gis','poi']];
    var wrk = 'workspace'
    var ly = 'layer'
    if (this.mode == 'draw_point') {
      wrk = 'gis'; ly = 'poi';
    } else if (this.mode == 'draw_line_string') {
      wrk = 'gis'; ly = 'test_polyline';
    } else {
      wrk = 'frvk'; ly = 'ply_frv';
    }
    const wfsUrl = `http://139.59.221.224:8080/geoserver/${wrk}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${ly}&outputFormat=application/json`;
    const index = `${wrk}-${ly}`;
    // console.log(wfsUrl);

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
        this.addLayerToMap(index, 'circle', 'circle-color', 3);
        this.addLayerToMap(index, 'line', 'line-color', 2);
      })
      .catch(error => console.error('Error fetching WFS data:', error));
  }

  private addLayerToMap(index: string, type: 'fill' | 'circle' | 'line', colorProperty: string, opacityOrRadius: number): void {
    const paint: { [key: string]: any } = {};
    paint[colorProperty] = ['get', 'color'];
    console.log(type);

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
    // console.log(paint);

  }
  //#endregion

  //#region Save Features
  private saveFeatureToApi(event: any): void {
    const data = this.draw.getAll() as FeatureCollection<Geometry, GeoJsonProperties>;
    const lines = data.features.filter(feature => feature.geometry.type === 'LineString');
    const polygons = data.features.filter(feature => feature.geometry.type === 'Polygon');
    const points = data.features.filter(feature => feature.geometry.type === 'Point');

    if (lines.length) {
      this.sendFeatureDataToGeoServer(lines, 'LineString');
    }
    if (polygons.length) {
      this.sendFeatureDataToGeoServer(polygons, 'Polygon');
    }
    if (points.length) {
      this.sendFeatureDataToGeoServer(points, 'Point');
    }
  }

  private sendFeatureDataToGeoServer(features: FeatureCollection<Geometry, GeoJsonProperties>['features'], type: string): void {
    var wrk = 'workspace'
    var ly = 'layer'
    var type = 'type'
    if (this.mode == 'draw_point') {
      wrk = 'gis'; ly = 'poi'; type='the_geom';
    } else if (this.mode == 'draw_line_string') {
      wrk = 'gis'; ly = 'test_polyline'; type='the_geom';
    } else {
      wrk = 'frvk'; ly = 'ply_frv'; type='ply_frv'; 
    }
    const dict = [wrk, ly, type, 'urn:ogc:def:crs:EPSG::4326'];
    const dialogRef = this.dialog.open(DialogWarningComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const wfsTransactionXml = this.geoServerService.convertGeoJSONToWFST(features, dict);
        const wfsUrl = 'http://139.59.221.224:8080/geoserver/wfs';

        fetch(wfsUrl, {
          method: 'POST',
          headers: {},
          body: wfsTransactionXml
        })
          .then(response => response.text())
          .then(() => {
            this.initializeMap();
            this.initializeDraw();
          })
          .catch(error => console.error(`Error saving ${type} data to GeoServer:`, error));
      } else {
        console.log('User chose not to save.');
        this.cancelDrawing();
      }
    });
  }
  //#endregion

  //#region Helpers
  private cancelDrawing(): void {
    this.draw.changeMode('simple_select');
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

  changePage(page: string): void {
    this.sharedService.changeMode(page);
  }
  //#endregion

  //#region Keyboard Events
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.cancelDrawing();
    }
    if (event.key === 'Backspace') {
      console.log(event);
      console.log(this.draw);
    }
  }
  //#endregion
}
