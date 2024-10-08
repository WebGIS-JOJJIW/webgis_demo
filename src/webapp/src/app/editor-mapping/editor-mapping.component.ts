import { Component, OnInit, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import maplibregl, { MapMouseEvent } from 'maplibre-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { SharedService } from '../../services/shared.service';
import { GeoServerService } from '../../services/geoserver.service';
import { Layer_List } from '../../models/layer.model';
import { DialogWarningComponent } from '../dialog-warning/dialog-warning.component';
import { MatSnackBar } from '@angular/material/snack-bar';

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
  activeEdit = false;
  private checkUpdate = false;
  private layer!: Layer_List;
  private proxy = '';
  private unsavedFeatures: any[] = [];
  activeDialog = false;
  constructor(
    public dialog: MatDialog,
    private sharedService: SharedService,
    private geoServerService: GeoServerService,
    private snackBar: MatSnackBar
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
    const savedZoom = localStorage.getItem('mapZoom');
    const savedCenter = localStorage.getItem('mapCenter');
    this.map = new maplibregl.Map({
      container: 'map',
      style: 'https://api.maptiler.com/maps/b9ce2a02-280d-4a34-a002-37f946992dfa/style.json?key=NRZzdXmGDnNvgNaaF4Ic',
      center: savedCenter ? JSON.parse(savedCenter) : [100.5018, 13.7563],
      zoom: savedZoom ? parseFloat(savedZoom) : 8,
    });

    this.map.addControl(new maplibregl.NavigationControl(), 'bottom-right');

    this.map.on('zoomend', () => {
      const zoomLevel = this.map.getZoom();
      localStorage.setItem('mapZoom', zoomLevel.toString());
    });

    this.map.on('moveend', () => {
      const center = this.map.getCenter();
      localStorage.setItem('mapCenter', JSON.stringify([center.lng, center.lat]));
    });

    this.map.on('load', () => {
      this.setMultiLayersOnMap();
      this.addCustomImages();
      this.initializeDraw();
      this.sharedService.currentActiveEdit.subscribe(x => {
        this.activeEdit = x
        if (x) {
          this.sharedService.setActiveAllowDraw(true);
          // Subscribe to drawing mode changes
          this.sharedService.currentMode.subscribe(mode => {
            if (mode && mode != 'draw_point') {
              this.draw.changeMode(mode);
            }
          });
        } else {
          this.sharedService.setActiveAllowDraw(false);
        }
      });  // get active add element

    });

    this.map.on('click', (event) => {
      if (this.mode === 'draw_point' && this.activeEdit) {
        this.addPointAtClick(event);
      }
      // console.log('click');

      const features = this.map.queryRenderedFeatures(event.point);
      if (features.length) {
        const feature = features[0];
        this.handleFeatureClick(event, feature.layer.id);
      }
    });
  }

  private initializeDraw(): void {
    this.draw = new MapboxDraw({
      displayControlsDefault: false
    });
    this.map.addControl(this.draw as any);

    // Bind create, update, delete event listeners
    this.map.on('draw.create', this.updateDrawnPolyFeatures.bind(this));
    this.map.on('draw.update', this.updateDrawnPolyFeatures.bind(this));
    this.map.on('draw.delete', this.updateDrawnPolyFeatures.bind(this));

    // Only attach feature click listeners once the map has loaded
    this.map.on('load', () => {
      if (this.mode === 'draw_polygon' || this.mode === 'draw_line_string') {
        // Listen for clicks on drawn features only
        this.map.on('click', (event) => {
        });
      }
    });
  }

  private subscribeToModeChanges(): void {
    this.sharedService.currentMode.subscribe(mode => {
      // if (mode != this.mode) {
      this.mode = mode;
      // }
    });

    this.sharedService.currentActiveAllowDraw.subscribe(x => {
      const mapContainer = document.getElementById('map');
      if (mapContainer) {
        if (x && this.activeEdit) {
          mapContainer.classList.add('pencil-cursor');
        } else {
          mapContainer.classList.remove('pencil-cursor');
        }
      }
    })

    this.sharedService.currentActiveSave.subscribe(x => {
      if (x && !this.activeDialog) {
        // write save to api with option 
        this.activeDialog = true;
        const dialogRef = this.dialog.open(DialogWarningComponent);
        dialogRef.afterClosed().subscribe(result => {
          this.activeDialog = false;
          if (result) {
            // console.log('save');
            this.saveFeatures();
          } else {
            console.log('User chose not to save.');
            // this.cancelDrawing();
          }
        });
      }
    });

    this.sharedService.currentActiveEdit.subscribe(x => {
      this.activeEdit = x
      if (x) {
        this.sharedService.setActiveAllowDraw(true);
        // Subscribe to drawing mode changes
        if (this.mode && this.mode != 'draw_point') {
          this.draw.changeMode(this.mode);
        }
      } else {
        this.sharedService.setActiveAllowDraw(false);
      }
    });  // get active add element

    this.sharedService.currentLayer.subscribe(x => {
      this.layer = x;
      this.initializeMap();
    });
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
          // console.log(data.features);
          this.previousFeatures = data.features
          data.features.forEach((feature: any) => {
            feature.properties.color = this.sharedService.getRandomColor();
            this.draw.add(feature);
          });

          this.map.addSource(`wfs-layer-${index}`, {
            type: 'geojson',
            data: data
          });

          if (this.mode == 'draw_polygon') {
            this.addLayerToMap(index, 'fill', 'fill-color', 0.2);
          }

          if (this.mode == 'draw_point') {
            // console.log(this.mode);

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
    }
  }
  //#endregion


  //#region Save Features
  saveFeatures(): void {
    const promises: Promise<void>[] = [];

    if (this.selectedDeletedId.length > 0) {
      promises.push(this.deletedFeatures());
    }
    if (this.checkUpdate) {
      promises.push(this.updateFeatures());
    }
    if (this.unsavedFeatures.length > 0) {
      promises.push(this.insertFeatures());
    }

    Promise.all(promises)
      .then(() => {
        this.initializeMap();
        this.sharedService.setActiveLayerEditor(false);
        this.snackBar.open('Operation successful', 'Close', {
          duration: 3000,
          panelClass: ['custom-snackbar', 'snackbar-success']
        });
        this.unsavedFeatures = []; // Clear unsaved features after processing
        this.checkUpdate = false;
        this.selectedDeletedId = [];
      })
      .catch(error => console.error('Error processing features:', error));

    if (this.selectedDeletedId.length === 0 && !this.checkUpdate && this.unsavedFeatures.length === 0) {
      this.sharedService.setActiveEdit(false);
      this.sharedService.setActiveSave(false);
    }
  }

  async insertFeatures(): Promise<void> {
    const wfsUrl = `${this.proxy}/wfs`;
    const dict = ['gis', this.layer.originalName, 'the_geom', 'urn:ogc:def:crs:EPSG::4326'];

    const wfsTransactionXmlInsert = this.geoServerService.convertGeoJSONToWFST(this.unsavedFeatures, dict);

    await this.fetchWFS(wfsUrl, wfsTransactionXmlInsert);
  }

  async updateFeatures(): Promise<void> {
    const wfsUrl = `${this.proxy}/wfs`;
    const dict = ['gis', this.layer.originalName, 'the_geom', 'urn:ogc:def:crs:EPSG::4326'];

    const wfsTransactionXmlUpdate = this.geoServerService.generateWFSUpdatePayload(this.previousFeatures, dict);

    await this.fetchWFS(wfsUrl, wfsTransactionXmlUpdate);
  }

  async deletedFeatures(): Promise<void> {
    const wfsUrl = `${this.proxy}/wfs`;
    const dict = ['gis', this.layer.originalName, 'the_geom', 'urn:ogc:def:crs:EPSG::4326'];

    const wfsTransactionXmlDelete = this.geoServerService.generateWFSDeletePayload(this.previousFeatures, dict);

    await this.fetchWFS(wfsUrl, wfsTransactionXmlDelete);
  }

  async fetchWFS(url: string, body: string): Promise<void> {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml',
        'Authorization': 'Basic ' + btoa('admin:geoserver')
      },
      body
    }).then(response => response.text())
      .catch(error => console.error('Error with fetch request:', error));
  }

  //#endregion

  //#region Helpers

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
    // console.log(event.key); 
    if (event.key === 'Backspace') {
      if (this.mode === 'draw_point') {
        this.deleteSelectedFeature();
      }
      if (this.mode === 'draw_polygon' || this.mode === 'draw_line_string') {
        // console.log(this.selectedFeatureId);

        if (this.selectedFeatureId) {
          this.draw.delete(this.selectedFeatureId);
          this.selectedDeletedId.push(this.selectedFeatureId);
          this.selectedFeatureId = null;
        }
      }
    }
  }
  //#endregion

  addCustomImages(): void {
    const imgUrl = 'assets/img/location.svg'; // Replace with your image URL
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

  /////////////////////////////////////////////////////////// new add element //////////////////////////////////////////////////////////////////////////////////////
  //#region  add point
  private addPointAtClick(event: maplibregl.MapMouseEvent): void {
    const lngLat = event.lngLat;
    const clickPoint: [number, number] = [lngLat.lng, lngLat.lat];
    const minDistance = 1; // Minimum distance in kilometers to prevent adding points (adjust as needed)

    // Retrieve the source
    const source = this.map.getSource(`wfs-layer-${this.layer.originalName}`) as maplibregl.GeoJSONSource;
    console.log(source);

    if (source) {
      const data = source._data as GeoJSON.FeatureCollection<GeoJSON.Geometry>;
      let isTooClose = false;
      console.log(data);

      // Check if the click location is too close to any existing features
      for (const feature of data.features) {
        if (feature.geometry.type === 'Point') {
          const coordinates = feature.geometry.coordinates;
          
          if (coordinates.length === 2) {
            const featurePoint: [number, number] = coordinates as [number, number];
            const distance = this.calculateDistance(clickPoint, featurePoint);
            // console.log(distance);
            console.log(distance);
            console.log(minDistance);
            
            if (distance < minDistance) {
              isTooClose = true;
              break;
            }
          } else {
            console.error('Feature coordinates are not in the expected format.');
          }
        }
      }
      console.log(isTooClose);
      
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

        // Add the new feature to the unsavedFeatures array
        this.unsavedFeatures.push(feature);
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
      // Add the new feature to the unsavedFeatures array
      this.unsavedFeatures.push(feature);

      // Add the appropriate layer if needed
      this.addLayerToMap(this.layer.originalName, 'symbol', 'icon-color', 1);
    }
  }

  private generateFeatureId(): string {
    return `feature-${Date.now()}`;
  }
  private selectedFeatureId: string | null = null;
  private selectedDeletedId = [''];
  private deleteSelectedFeature(): void {
    // console.log(this.selectedFeatureId);

    if (this.selectedFeatureId) {
      const source = this.map.getSource(`wfs-layer-${this.layer.originalName}`) as maplibregl.GeoJSONSource;

      if (source) {
        // Get the current data from the source
        const currentData = source._data as GeoJSON.FeatureCollection<GeoJSON.Geometry>;

        // Find the feature to be deleted
        const featureToDelete = currentData.features.find(feature => feature.id === this.selectedFeatureId);
        const updatedFeatures = currentData.features.filter(feature => feature.id !== this.selectedFeatureId);

        // Update the source with the new data
        source.setData({
          type: 'FeatureCollection',
          features: updatedFeatures
        });

        // Remove the deleted feature from the unsavedFeatures array
        if (featureToDelete) {
          this.unsavedFeatures = this.unsavedFeatures.filter(feature => feature.id !== featureToDelete.id);
        }
        // Clear the selected feature
        this.selectedFeatureId = null;
      }
    }
  }

  private selectFeatureAtClick(event: maplibregl.MapMouseEvent): void {
    const features = this.map.queryRenderedFeatures(event.point);
    // console.log(features);
    if (features.length > 0) {
      const feature = features[0];
      this.selectedFeatureId = feature.properties['id'] != undefined ? feature.properties['id'] : null;
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
  //#endregion

  //#region  polyline 
  selectPolyFeature(featureId: string) {
    this.selectedFeatureId = featureId;
  }

  private previousFeatures: any[] = []; // Store the previous state of features
  updateDrawnPolyFeatures(event: any) {
    // Get the changed features from the event object
    const changedFeatures = event.features;
    console.log(changedFeatures);

    // Create a map of changed features by their id for quick lookup
    const changedFeaturesMap = new Map(changedFeatures.map((f: { id: any; }) => [f.id, f]));

    // Replace existing features in unsavedFeatures and previousFeatures with the changed features
    this.unsavedFeatures = this.unsavedFeatures.map(existingFeature =>
      changedFeaturesMap.has(existingFeature.id) ? changedFeaturesMap.get(existingFeature.id) : existingFeature
    );

    this.previousFeatures = this.previousFeatures.map(existingFeature =>
      changedFeaturesMap.has(existingFeature.id) ? changedFeaturesMap.get(existingFeature.id) : existingFeature
    );

    let act = this.previousFeatures.find(x => changedFeaturesMap.has(x.id))
    if (act) {
      this.checkUpdate = true;
    }

    // Filter out features from changedFeatures that are already in previousFeatures
    const newFeatures = changedFeatures.filter((f: { id: any; }) =>
      !this.previousFeatures.some(existingFeature => existingFeature.id === f.id) &&
      !this.unsavedFeatures.some(existingFeature => existingFeature.id === f.id)
    );

    // Add new features that are not already in unsavedFeatures
    this.unsavedFeatures = [...this.unsavedFeatures, ...newFeatures];

    if (this.mode && this.mode != 'draw_point') {
      this.sharedService.setActiveAllowDraw(false);
    }

  }

  handleFeatureClick(event: MapMouseEvent, layerId: string) {
    // Query features at the click location
    const features = this.map.queryRenderedFeatures(event.point, {
      layers: [layerId]
    });
    // console.log('Feature clicked for editing:', features[0]);

    if (features.length > 0) {

      const feature = features[0];
      const featureId = feature.properties['id'] != undefined ? feature.properties['id'] : null;
      // console.log( typeof featureId, featureId);

      // Ensure featureId is a string before calling selectFeature
      if (typeof featureId === 'string') {
        this.selectPolyFeature(featureId);
        // console.log(featureId);

      }
    }
  }
  //#endregion
}
