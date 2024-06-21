import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import maplibregl, { MapLayerMouseEvent, Marker, NavigationControl } from 'maplibre-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';

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
      center: [-74.3100039,40.697538], // starting position [lng, lat]
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
        trash: true
      },
      defaultMode: 'draw_line_string'//'draw_polygon' 
    });

    (this.map as any).addControl(this.draw as any);

    this.map.on('draw.create', this.onDrawCreate.bind(this));
    this.map.on('draw.update', this.onDrawUpdate.bind(this));
  }

  onDrawCreate(event: any): void {
    console.log('Draw create:', event);
    this.saveFeatureToApi(event)
  }

  onDrawUpdate(event: any): void {
    console.log('Draw update:', event);
  }

  // addEventListeners(): void {
  //   this.map.on('click', this.onMapClick.bind(this));
  //   document.addEventListener('keydown', this.onKeyDown.bind(this));
  // }

  // onMapClick(event: MapLayerMouseEvent): void {
  //   const features = this.map.queryRenderedFeatures(event.point);
  //   if (features.length > 0) {
  //     this.selectedLayerId = features[0].layer.id;
  //     console.log('Selected layer ID:', this.selectedLayerId);
  //   } else {
  //     this.selectedLayerId = null;
  //   }
  // }

  // onKeyDown(event: KeyboardEvent): void {
  //   if (event.key === 'Backspace' && this.selectedLayerId) {
  //     this.map.removeLayer(this.selectedLayerId);
  //     this.map.removeSource(this.selectedLayerId);
  //     this.selectedLayerId = null;
  //     console.log('Layer deleted');
  //   }
  // }

  setLayerOnMaps() {
    const workspace = 'tiger';
    const layer = 'tiger_roads';
    const wfsUrl = `http://139.59.221.224:8080/geoserver/${workspace}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${layer}&outputFormat=application/json`;
    
    fetch(wfsUrl)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        // Add the GeoJSON data as a new source
        this.map.addSource('wfs-layer', {
          'type': 'geojson',
          'data': data
        });

        // Add a layer to use the new source
        // this.map.addLayer({
        //   'id': 'wfs-layer',
        //   'type': 'circle', // Change to 'line' or 'symbol' depending on your data
        //   'source': 'wfs-layer',
        //   'paint': {
        //     'circle-color': 'hsla(0,0%,0%,0.75)',
        //     'circle-stroke-width': 1.5,
        //     'circle-stroke-color': 'white'
        //   }
        // });

        
        this.map.addLayer({
          'id': 'wfs-layer-fill',
          'type': 'fill',
          'source': 'wfs-layer',
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
    var workspaceLayer = [['topp', 'states'], ['topp', 'tasmania_water_bodies']];
    workspaceLayer.forEach(element => {
      const wfsUrl = `http://139.59.221.224:8080/geoserver/${element[0]}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${element[1]}&outputFormat=application/json`;
      var index = element[0] + '-' + element[1];
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
    
    if (lines.length > 0) {
      this.sendFeatureDataToGeoServer(lines, 'LineString');
    }
    if (polygons.length > 0) {
      this.sendFeatureDataToGeoServer(polygons, 'Polygon');
    }
  }


  sendFeatureDataToGeoServer(features: FeatureCollection<Geometry, GeoJsonProperties>['features'], type: string): void {
    const wfsTransactionXml = this.convertGeoJSONToWFST(features);
    const wfsUrl = 'YOUR_GEOSERVER_WFS_URL_HERE';

    console.log('wfsTransactionXml : ',wfsTransactionXml);
    
    // fetch(wfsUrl, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/xml'
    //   },
    //   body: wfsTransactionXml
    // })
    // .then(response => response.text())
    // .then(data => {
    //   console.log(`${type} data saved to GeoServer:`, data);
    // })
    // .catch(error => {
    //   console.error(`Error saving ${type} data to GeoServer:`, error);
    // });
  }

  convertGeoJSONToWFST(features: FeatureCollection<Geometry, GeoJsonProperties>['features']): string {
    const featureType = 'frvk:roads_papaya'; // replace with your feature type
    const typeName = 'frvk'; // replace with your type name
    const srsName = 'urn:ogc:def:crs:EPSG::4326'; // replace with your SRS name

    let transactionXml = `
      <wfs:Transaction service="WFS" version="1.0.0"
                       xmlns:wfs="http://www.opengis.net/wfs"
                       xmlns:gml="http://www.opengis.net/gml"
                       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                       xmlns:ogc="http://www.opengis.net/ogc"
                       xsi:schemaLocation="http://www.opengis.net/wfs
                       http://schemas.opengis.net/wfs/1.0.0/wfs.xsd">
        <wfs:Insert>
          <${featureType}>
    `;

    features.forEach((feature) => {
      transactionXml += `
        <${typeName}>
          <gml:featureMember>
            <${typeName} fid="${feature.id}">
              <gml:geometryProperty>
                ${this.geometryToGml(feature.geometry)}
              </gml:geometryProperty>
            </${typeName}>
          </gml:featureMember>
        </${typeName}>
      `;
    });

    transactionXml += `</${featureType}>
        </wfs:Insert>
      </wfs:Transaction>
    `;

    return transactionXml;
  }

  geometryToGml(geometry: Geometry): string {
    if (geometry.type === 'Point') {
      const [x, y] = geometry.coordinates;
      return `<gml:Point srsName="urn:ogc:def:crs:EPSG::4326"><gml:coordinates>${x},${y}</gml:coordinates></gml:Point>`;
    } else if (geometry.type === 'LineString') {
      const coordinates = geometry.coordinates.map(coord => coord.join(',')).join(' ');
      return `<gml:LineString srsName="urn:ogc:def:crs:EPSG::4326"><gml:coordinates>${coordinates}</gml:coordinates></gml:LineString>`;
    } else if (geometry.type === 'Polygon') {
      const coordinates = geometry.coordinates[0].map(coord => coord.join(',')).join(' ');
      return `<gml:Polygon srsName="urn:ogc:def:crs:EPSG::4326"><gml:outerBoundaryIs><gml:LinearRing><gml:coordinates>${coordinates}</gml:coordinates></gml:LinearRing></gml:outerBoundaryIs></gml:Polygon>`;
    }
    return '';
  }

  //#endregion

}
