import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import maplibregl, { MapLayerMouseEvent, Marker, NavigationControl } from 'maplibre-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import { DialogWarningComponent } from '../dialog-warning/dialog-warning.component';

@Component({
  selector: 'app-editor-mapping',
  templateUrl: './editor-mapping.component.html',
  styleUrl: './editor-mapping.component.css'
})
export class EditorMappingComponent {
  constructor(public dialog: MatDialog) { }
  private map!: maplibregl.Map;
  markers: Marker[] = [];
  private draw!: MapboxDraw;

  ngOnInit(): void {

    this.map = new maplibregl.Map({
      container: 'map',
      style: 'https://api.maptiler.com/maps/b9ce2a02-280d-4a34-a002-37f946992dfa/style.json?key=NRZzdXmGDnNvgNaaF4Ic',
      center: [-74.3100039, 40.697538], // starting position [lng, lat]
      zoom: 3 // starting zoom
    });
    this.map.addControl(new NavigationControl({}), 'bottom-right')
    this.setMultiLayersOnMap();
    this.drawPolygon();
  }

  //#region Layers 
  drawPolygon() {
    this.draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        line_string: true,
        polygon: true,
        point: true,
        trash: true
      },
      defaultMode: 'draw_point'//'draw_polygon' , 'draw_line_string'
    });

    (this.map as any).addControl(this.draw as any);
    this.map.on('draw.create', this.onDrawCreate.bind(this));
    this.map.on('draw.update', this.onDrawUpdate.bind(this));
    this.map.on('draw.delete', this.onDrawUpdate.bind(this));
  }

  onDrawCreate(event: any): void {
    // console.log('Draw create:', event);
    this.saveFeatureToApi(event)
  }

  onDrawUpdate(event: any): void {
    console.log('Draw update:', event);
  }

  setLayerOnMaps() {
    const workspace = 'tiger';
    const layer = 'tiger_roads';
    const wfsUrl = `http://139.59.221.224:8080/geoserver/${workspace}/ows?service=WFS&version=1.0.0&request=GetFeature` +
      `&typeName=${layer}&outputFormat=application/json`;

    fetch(wfsUrl)
      .then(response => response.json())
      .then(data => {
        // console.log(data);
        // Add the GeoJSON data as a new source
        this.map.addSource('wfs-layer', {
          'type': 'geojson',
          'data': data
        });


        this.map.addLayer({
          'id': 'wfs-layer-fill',
          'type': 'fill',
          'source': 'wfs-layer',
          'paint': {
            'fill-color': [
              'match',
              ['get', 'EPSG::4326'], // Property name in your GeoJSON data to match
              'value1', '#f00', // Red for value1
              'value2', '#0f0', // Green for value2
              '#00f' // Blue as a default color
            ],
            'fill-opacity': 0.5 // Set the fill opacity
          }
        });

        // Optionally, add a border layer for the multipolygons
        this.map.addLayer({
          'id': 'wfs-layer-borders',
          'type': 'line',
          'source': 'wfs-layer',
          'paint': {
            'line-color': '#000', // Set the border color
            'line-width': 2 // Set the border width
          }
        });
      })
      .catch(error => console.error('Error fetching WFS data:', error));
  }

  removeDrawnFeature(): void {
    if (this.map.getLayer('polygon')) {
      this.map.removeLayer('polygon');
    }
    if (this.map.getSource('polygon')) {
      this.map.removeSource('polygon');
    }
  }

  setMultiLayersOnMap() {
    var workspaceLayer = [['frvk', 'pois_state']];
    workspaceLayer.forEach(element => {
      const wfsUrl = `http://139.59.221.224:8080/geoserver/${element[0]}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${element[1]}&outputFormat=application/json`;
      var index = element[0] + '-' + element[1];
      console.log(wfsUrl);
      
      fetch(wfsUrl)
        .then(response => response.json())
        .then(data => {
          console.log(data);
          // Add the GeoJSON data as a new source
          this.map.addSource(`wfs-layer-${index}`, {
            'type': 'geojson',
            'data': data
          });

          this.map.addLayer({
            'id': `wfs-layer-fill-${index}`,
            'type': 'fill',
            'source': `wfs-layer-${index}`,
            'paint': {
              'fill-color': [
                'match',
                ['get', 'urn:ogc:def:crs:EPSG::4326'], // Property name in your GeoJSON data to match
                'value1', '#f00', // Red for value1
                'value2', '#0f0', // Green for value2
                '#00f' // Blue as a default color
              ],
              'fill-opacity': 0.5 // Set the fill opacity
            }
          });

          this.map.addLayer({
            'id': `wfs-layer-circle-${index}`,
            'type': 'circle',
            'source': `wfs-layer-${index}`,
            'paint': {
              'circle-radius': 10,
              'circle-color': '#FB0303'
            }
          });

          // Optionally, add a border layer for the multipolygons
          this.map.addLayer({
            'id': `wfs-layer-borders-${index}`,
            'type': 'line',
            'source': `wfs-layer-${index}`,
            'paint': {
              'line-color': '#000', // Set the border color
              'line-width': 2 // Set the border width
            }
          });
        })
        .catch(error => console.error('Error fetching WFS data:', error));
    });

  }

  saveFeatureToApi(e: any): void {
    // Cast the returned data to FeatureCollection
    const data = this.draw.getAll() as FeatureCollection<Geometry, GeoJsonProperties>;
    const lines = data.features.filter((feature) => feature.geometry.type === 'LineString');
    const polygons = data.features.filter((feature) => feature.geometry.type === 'Polygon');
    const point = data.features.filter((feature) => feature.geometry.type === 'Point');

    if (lines.length > 0) {
      this.sendFeatureDataToGeoServer(lines, 'LineString');
    }
    if (polygons.length > 0) {
      this.sendFeatureDataToGeoServer(polygons, 'Polygon');
    }
    if (point.length > 0) {
      this.sendFeatureDataToGeoServer(point, 'Point');
    }
  }


  sendFeatureDataToGeoServer(features: FeatureCollection<Geometry, GeoJsonProperties>['features'], type: string): void {

    const dialogRef = this.dialog.open(DialogWarningComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {// User clicked Yes
        const wfsTransactionXml = this.convertGeoJSONToWFST(features);
        const wfsUrl = 'http://139.59.221.224:8080/geoserver/wfs';
        
        fetch(wfsUrl, {
          method: 'POST',
          headers: {},
          body: wfsTransactionXml
        })
          .then(response => response.text())
          .then(data => {
            console.log(`${type} data saved to GeoServer:`, data);
            window.location.reload();
          })
          .catch(error => {
            console.error(`Error saving ${type} data to GeoServer:`, error);
          });

      } else {// User clicked No
        console.log('User chose not to save.');
      }
    });
  }

  convertGeoJSONToWFST(features: FeatureCollection<Geometry, GeoJsonProperties>['features']): string {
    const featureType = 'frvk:pois_state'; // replace with your feature type
    const typeName = 'frvk'; // replace with your type name
    const srsName = 'urn:ogc:def:crs:EPSG::4326'; // replace with your SRS name

    let transactionXml = `
      <wfs:Transaction service="WFS" version="1.1.0"
                       xmlns:wfs="http://www.opengis.net/wfs"
                       xmlns:gml="http://www.opengis.net/gml"
                       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                       xmlns:ogc="http://www.opengis.net/ogc"
                       xsi:schemaLocation="http://www.opengis.net/wfs
                       http://schemas.opengis.net/wfs/1.1.0/wfs.xsd">
        <wfs:Insert>
          <${featureType} xmlns:${typeName}="${typeName}">
    `;

    features.forEach((feature) => {

      if (feature.geometry.type === 'Polygon') {
        transactionXml += `
        <${featureType}>
          <gml:featureMember>
            <${featureType}>
              <gml:geometryProperty>
                ${this.geometryToGml(feature.geometry, srsName)}
              </gml:geometryProperty>
            </${featureType}>
          </gml:featureMember>
        </${featureType}>
      `;
      } else {
        transactionXml += `
        <${featureType}>
                ${this.geometryToGml(feature.geometry, srsName)}
        </${featureType}>
      `;
      }

    });

    transactionXml += `</${featureType}>
        </wfs:Insert>
      </wfs:Transaction>
    `;

    return transactionXml;
  }

  geometryToGml(geometry: Geometry, srsName: string): string {
    if (geometry.type === 'Point') {
      const [x, y] = geometry.coordinates;
      return `<gml:Point srsName="${srsName}">
      <gml:coordinates>${y},${x}</gml:coordinates>
      </gml:Point>`;
    } else if (geometry.type === 'LineString') {
      const coordinates = geometry.coordinates.map(coord => coord.join(',')).join(' ');
      return `<gml:LineString srsName="${srsName}">
        <gml:coordinates>${coordinates}
        </gml:coordinates>
      </gml:LineString>`;
    } else if (geometry.type === 'Polygon') {
      const coordinates = geometry.coordinates[0].map(coord => coord.join(',')).join(' ');
      return `<gml:Polygon srsName="${srsName}">
        <gml:outerBoundaryIs>
        <gml:LinearRing>
          <gml:coordinates>${coordinates}</gml:coordinates>
        </gml:LinearRing>
        </gml:outerBoundaryIs>
        </gml:Polygon>`;
    }
    return '';
  }

  //#endregion

}
