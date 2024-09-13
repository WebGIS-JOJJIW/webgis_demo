import { Component, OnInit, OnDestroy } from '@angular/core';
import maplibregl, { GeoJSONSource, Marker, NavigationControl } from 'maplibre-gl';
import { MatDialog } from '@angular/material/dialog';
import { SharedService } from '../../services/shared.service';
import { GeoServerService } from '../../services/geoserver.service';
import { SensorData } from '../../models/sensor_data.model';
import { Feature, FeatureCollection, MarkerDetailsData, Sensor } from '../../models/sensor.model';
import { HttpClient } from '@angular/common/http';
import { SensorDataService } from '../../services/sensor-data.service';
import { LayerDisplay } from '../../models/layer.model';

@Component({
  selector: 'app-live-motion',
  templateUrl: './live-motion.component.html',
  styleUrl: './live-motion.component.css'
})
export class LiveMotionComponent implements OnInit, OnDestroy {
  constructor(private dialog: MatDialog, private sharedService: SharedService, private geoService: GeoServerService
    , private http: HttpClient, private sensorDataService: SensorDataService
  ) {
    this.dialog.closeAll();
    this.sharedService.TurnOnOrOff(false);
  }
  private map!: maplibregl.Map;
  markers: Marker[] = [];
  activeFlag = false;
  layersId = [''];
  layersDisplay: LayerDisplay[] = [];
  sensor: Sensor[] = [];
  dialogOpen = ''
  dataSensor: MarkerDetailsData | undefined;
  activeEventFull = false;

  lngLat = [102.5552, 13.6600]

  ngOnInit(): void {
    this.addCustomImages();
    this.initializeMap();
    this.setupSubscriptions();
  }

  initializeMap(): void {
    this.map = new maplibregl.Map({
      container: 'map',
      style: 'https://api.maptiler.com/maps/b9ce2a02-280d-4a34-a002-37f946992dfa/style.json?key=NRZzdXmGDnNvgNaaF4Ic',
      center: this.lngLat as [number, number], // starting position [lng, lat]
      zoom: 14, // starting zoom
    });
    this.map.addControl(new NavigationControl({}), 'bottom-right');
  }

  setupSubscriptions(): void {
    this.sharedService.currentDialogOpen.subscribe(res => {
      this.dialogOpen = res;
    })

    this.sharedService.currentActiveEventFull.subscribe(x => this.activeEventFull = x);

    this.sharedService.currentSensorData.subscribe(res => {
      this.dataSensor = res;
    })

    this.sharedService.currentLayersDisplay.subscribe(res => {
      this.removeLayersFromMap();
      this.layersDisplay = res;
      this.showLayerDataOnMap(this.layersDisplay);
    });

    this.initailSensorData();
    this.sensorDataService.subscribeToMainChannel().subscribe(data => {
      this.refreshSensorPoints();
    });



    this.sharedService.currentShowLayerComp.subscribe(flag => {
      if (flag != this.activeFlag) {
        this.activeFlag = flag;
      }

      if (flag) {
        this.dialog.closeAll()
      }
    });

    this.sharedService.currentActiveEventFull.subscribe(x => {
      if (x) {
        this.dialog.closeAll()
      }
    })
  }

  initailSensorData() {
    this.http.get<SensorData[]>(`http://${window.location.hostname}:3001/sensor_data`).subscribe(res => {
      this.getSensorsPoint(res);
    }, err => {
      this.getSensorsPoint([]);
    });
  }

  refreshSensorPoints(): void {
    this.clearSensorLayers();
    this.http.get<SensorData[]>(`http://${window.location.hostname}:3001/sensor_data`).subscribe(res => {
      this.getSensorsPoint(res);
    }, err => {
      this.getSensorsPoint([]);
    });
  }

  clearSensorLayers(): void {
    this.map.getStyle().layers.forEach((layer) => {
      if (layer.id.startsWith('sensor-layer-')) {
        this.map.removeLayer(layer.id);
        if (this.map.getSource(layer.id)) {
          this.map.removeSource(layer.id);
        }
      }
    });
  }

  showLayerDataOnMap(layers: LayerDisplay[]): void {
    if (layers.length > 0) {

      console.log('showLayerDataOnMap');

      const filterGroup = document.getElementById('filter-group');

      if (!filterGroup) {
        console.error('Filter group element not found');
        return;
      }

      layers.forEach(ele => {
        let url = `${this.geoService.GetProxy()}`;
        const layerId = `id-${ele.name}`;
        if (ele.type === 'VECTOR') {
          url += `/gis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${ele.name}&outputFormat=application/json`;
          this.geoService.getLayerDetails(url).subscribe(
            data => {
              if (data.features.length > 0) {
                data.features.forEach((feature: any) => {
                  feature.properties.color = this.sharedService.getRandomColor();
                });
                if (!this.map.getSource(layerId)) {
                  this.map.addSource(layerId, {
                    type: 'geojson',
                    data: data
                  });
                }

                if (!this.map.getLayer(layerId)) {
                  this.layersId.push(layerId);

                  if (data.features[0].geometry.type === 'Point') {
                    this.addPoint(layerId).then(() => {
                      this.addFilterCheckbox(filterGroup, layerId, ele.name);
                    });
                  }
                  else if (data.features[0].geometry.type === 'Polygon') {
                    this.addPolylineAndPolygon(layerId, 'fill', 'fill-color', 0.5).then(() => {
                      this.addFilterCheckbox(filterGroup, layerId, ele.name);
                    });
                  }
                  else {
                    this.addPolylineAndPolygon(layerId, 'line', 'line-color', 2).then(() => {
                      this.addFilterCheckbox(filterGroup, layerId, ele.name);
                    });
                  }


                } else {
                  console.warn(`Layer with ID ${layerId} already exists.`);
                  this.addFilterCheckbox(filterGroup, layerId, ele.name);
                }
              } else {
                this.addFilterCheckbox(filterGroup, layerId, ele.name);
              }

            },
            error => {
              console.error('Error fetching places data', error);
            }
          );
        } else if (ele.type === 'RASTER') {
          // Add RASTER URL logic if needed
          url += `/gis/wms?service=WMS&version=1.1.0&request=GetMap&layers=gis%3A${ele.name}&bbox={bbox-epsg-3857}&width=512&height=512&srs=EPSG%3A3857&styles=&format=image%2Fpng&TRANSPARENT=true`;
          // console.log(url);

          this.setRaster(layerId, url);
          this.addFilterCheckbox(filterGroup, layerId, ele.name);
        }
      });
    }
  }

  // addPoint(layerId: string): Promise<void> {
  //   return new Promise((resolve) => {
  //     if (!this.map.getLayer(layerId)) {
  //       this.map.addLayer({
  //         id: layerId,
  //         type: 'symbol',
  //         source: layerId,
  // filter: ['has', 'point_count'],
  //         layout: {
  //           'icon-image': 'custom-marker',
  //           'icon-size': 1.5,
  //           'text-field': '{title}',
  //           'text-offset': [0, 1.25],
  //           'text-anchor': 'top'
  //         },
  //         minzoom: 0, // Add minzoom
  //         maxzoom: 24 // Add maxzoom
  //       });

  //       this.map.once('idle', () => {
  //         resolve();
  //       });
  //     } else {
  //       console.warn(`Point layer with ID ${layerId} already exists.`);
  //       resolve();
  //     }
  //   });
  // }

  addPoint(layerId: string): Promise<void> {
    return new Promise((resolve) => {
      if (!this.map.getLayer(layerId)) {
        // Add a layer for clustered points
        this.map.addLayer({
          id: layerId,
          type: 'circle',
          source: layerId,
          filter: ['has', 'point_count'], // Filter for clustered points
          paint: {
            'circle-color': '#51bbd6',
            'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40]
          }
        });

        // Add a layer for unclustered points
        this.map.addLayer({
          id: `${layerId}-unclustered`,
          type: 'symbol',
          source: layerId,
          filter: ['!', ['has', 'point_count']], // Filter for unclustered points
          layout: {
            'icon-image': 'custom-marker',
            'icon-size': 1.5,
            'text-field': '{title}',
            'text-offset': [0, 1.25],
            'text-anchor': 'top'
          }
        });

        // this.map.addLayer({
        //   id: `${layerId}-unclustered`,
        //   type: 'circle',
        //   source: layerId,
        //   filter: ['!', ['has', 'point_count']],// Filter for clustered points
        //   paint: {
        //     'circle-color': '#ffff',
        //     'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40]
        //   }
        // });

        this.map.once('idle', () => {
          resolve();
        });
      } else {
        console.warn(`Layer with ID ${layerId} already exists.`);
        resolve();
      }
    });
  }

  getSensorsPoint(sensorData: SensorData[]) {
    const url = `${this.geoService.GetProxy()}/gis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=sensors&outputFormat=application/json`;
    // const url= `http://128.199.168.212:8080/geoserver/gis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=sensors&outputFormat=application/json`
    this.http.get<FeatureCollection>(url).subscribe(res => {
      // console.log(res);
      let sensors = ['sensor1', 'sensor2']
      sensors.forEach((ele, inx) => {
        if (res.features.filter(x => x.properties.name === ele).length > 0) {
          const sensorMarker = this.getDataSensorFilter(ele, sensorData, res.features.filter(x => x.properties.name === ele));
          this.addSensorMarkerToMap(`sensor-layer-${ele}`, sensorMarker);

          if (this.dialogOpen === ele && this.dataSensor?.latestPhotoTime != sensorMarker.latestPhoto) {
            this.sharedService.updateSensorData(sensorMarker)
          }
        }
      });
    });
  }

  getDataSensorFilter(sensor_id: string, sensorData: SensorData[], data: Feature[]): Sensor {
    let sensor_marker: Sensor = {
      coordinates: [data[0].geometry.coordinates[0], data[0].geometry.coordinates[1]],
      title: data[0].properties.name ?? '',
      humanCount: this.getRandomInt(4),
      vehicleCount: this.getRandomInt(4),
      otherCount: this.getRandomInt(4),
      healthStatus: 'Good',
      healthTime: '',
      latestPhotoTime: '',
      latestPhoto: ``,
      previousPhotos: []
    }
    let dataFilter = sensorData.filter(x => x.sensor_poi_id === sensor_id);
    if (dataFilter.length > 0) {
      dataFilter = this.sharedService.sortEventsByDateTime(dataFilter);
      sensor_marker.healthTime = this.sharedService.formatDate(dataFilter[0].dt);
      sensor_marker.title = dataFilter[0].sensor_name
      sensor_marker.latestPhotoTime = this.sharedService.formatDate(dataFilter[0].dt),
        sensor_marker.latestPhoto = `http://${window.location.hostname}/${dataFilter[0].value}`,
        sensor_marker.previousPhotos = this.sharedService.getPhotos(dataFilter)
    }
    return sensor_marker;
  }

  getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
  }

  setRaster(layerId: string, url: string) {
    if (!this.map.getLayer(`${layerId}`)) {
      // console.log('addSource');

      this.map.addSource(`${layerId}`, {
        type: 'raster',
        tiles: [
          `${url}` // URL template for the raster tiles
        ],
        tileSize: 512 // Tile size in pixels (256 is common)
      });

      // Add a raster layer
      this.map.addLayer({
        id: `${layerId}`,
        type: 'raster',
        source: `${layerId}`,
        paint: { 'raster-opacity': 1.0 }
      });

    }
  }

  addPolylineAndPolygon(layerId: string, type: 'fill' | 'circle' | 'line', colorProperty: string, opacityOrRadius: number): Promise<void> {
    return new Promise((resolve) => {
      const paint: { [key: string]: any } = {};
      paint[colorProperty] = ['get', 'color'];

      if (!this.map.getLayer(`${layerId}`)) {
        if (type === 'fill') {
          paint['fill-opacity'] = opacityOrRadius;
          this.map.addLayer({
            id: `${layerId}`,
            type: 'fill',
            source: layerId,
            paint: paint
          });

          this.map.once('idle', () => {
            resolve();
          });
        } else if (type === 'circle') {
          paint['circle-radius'] = opacityOrRadius;
          this.map.addLayer({
            id: `${layerId}`,
            type: 'circle',
            source: layerId,
            paint: paint
          });

          this.map.once('idle', () => {
            resolve();
          });
        } else if (type === 'line') {
          paint['line-width'] = opacityOrRadius;
          this.map.addLayer({
            id: `${layerId}`,
            type: 'line',
            source: layerId,
            paint: paint
          });

          this.map.once('idle', () => {
            resolve();
          });
        }
      } else {
        console.warn(`Layer with ID ${layerId} already exists.`);
        resolve();
      }
    });
  }

  addFilterCheckbox(filterGroup: HTMLElement, layerId: string, name: string): void {

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
      if (this.map.getLayer(layerId)) {
        this.map.setLayoutProperty(
          layerId,
          'visibility',
          target.checked ? 'visible' : 'none'
        );
      } else {
        // console.error(`Layer with ID ${layerId} does not exist.`);
      }
    });
  }

  addSensorMarkerToMap(layerId: string, sensorMarker: Sensor) {
    // Remove existing source and layer if they exist
    if (this.map.getSource(layerId)) {
      if (this.map.getLayer(layerId)) {
        this.map.removeLayer(layerId);
      }
      this.map.removeSource(layerId);
    }
  
    // Add the new source with larger cluster radius and lower clusterMaxZoom
    this.map.addSource(layerId, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: sensorMarker.coordinates
          },
          properties: {
            title: sensorMarker.title
          }
        }]
      },
      cluster: true,               // Enable clustering
      clusterMaxZoom: 6,           // Allow clustering at lower zoom levels (zoomed out)
      clusterRadius: 500           // Larger cluster radius in pixels for zoomed-out view
    });
  
    // Add clustered points layer
    this.map.addLayer({
      id: `${layerId}-clusters`,
      type: 'circle',
      source: layerId,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#51bbd6', 100, '#f1f075', 750, '#f28cb1'
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20, 100, 30, 750, 40
        ]
      }
    });
  
    // Add unclustered points layer
    this.map.addLayer({
      id: `${layerId}-unclustered`,
      type: 'symbol',
      source: layerId,
      filter: ['!', ['has', 'point_count']], // Filter for unclustered points
      layout: {
        'icon-image': 'custom-marker',
        'icon-size': 1.5,
        'text-field': '{title}',
        'text-offset': [0, 1.25],
        'text-anchor': 'top'
      }
    });
  
    // Add a layer for the cluster count labels
    this.map.addLayer({
      id: `${layerId}-cluster-count`,
      type: 'symbol',
      source: layerId,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      }
    });
  
    // Click event for clusters to zoom in
    this.map.on('click', `${layerId}-clusters`, (e) => {
      const features = this.map.queryRenderedFeatures(e.point, {
        layers: [`${layerId}-clusters`]
      });
      const clusterId = features[0].properties['cluster_id'];
  
      // Cast the source to GeoJSONSource
      const source = this.map.getSource(layerId) as GeoJSONSource;
  
      // Call getClusterExpansionZoom
      source.getClusterExpansionZoom(clusterId).then((zoom: number) => {
        this.map.easeTo({
          center: sensorMarker.coordinates,
          zoom: zoom
        });
      }).catch((err: any) => {
        console.error('Error getting cluster expansion zoom:', err);
      });
    });
  
    // Click event for unclustered points to open the dialog
    this.map.on('click', `${layerId}-unclustered`, (e) => {
      this.sharedService.openDialog(sensorMarker, this.dialog);
      console.log(sensorMarker);
      
      this.setCloseAllPanel();
    });
  
    // Change the cursor to a pointer when over clusters or unclustered points
    this.map.on('mouseenter', `${layerId}-clusters`, () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });
    this.map.on('mouseenter', `${layerId}-unclustered`, () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });
  
    this.map.on('mouseleave', `${layerId}-clusters`, () => {
      this.map.getCanvas().style.cursor = '';
    });
    this.map.on('mouseleave', `${layerId}-unclustered`, () => {
      this.map.getCanvas().style.cursor = '';
    });
  }
  

  setCloseAllPanel() {
    this.sharedService.setEventActiveFull(false);
    this.sharedService.ChangeShowLayerComp(false);
  }


  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
  //#endregion


  addCustomImages(): void {
    // Add your custom marker image
    const imgUrl = 'assets/img/location.svg'; // Replace with your image URL
    const img = new Image(25, 25); // Adjust the size as needed
    img.onload = () => {
      if (!this.map.hasImage('custom-marker')) {
        this.map.addImage('custom-marker', img);
      }
    };
    img.src = imgUrl;
  }


  removeLayersFromMap(): void {
    // console.log('removeLayersFromMap');

    const filterGroup = document.getElementById('filter-group');
    if (!filterGroup) {
      console.error('Filter group element not found');
      return;
    }

    this.layersDisplay.forEach(ele => {
      const layerId = `id-${ele.name}`;
      // console.log(this.map.getLayer(layerId));

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

    // Clear the layersDisplay array
    this.layersDisplay = [];
  }

}
