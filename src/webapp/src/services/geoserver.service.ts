import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import { DialogWarningComponent } from '../app/dialog-warning/dialog-warning.component';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { MatDialog } from '@angular/material/dialog';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root'
})
export class GeoServerService {
  
    private ipAddr = `139.59.221.224:8080`
    private wfsUrl = `http://${this.ipAddr}/geoserver/wfs`;

    constructor(private http: HttpClient,
      private dialog: MatDialog,private shareService: SharedService) { }

    pushData(payload: string): Observable<any> {
        const headers = new HttpHeaders({ });
        return this.http.post(this.wfsUrl, payload, { headers, responseType: 'text' });
    }

    fetchData(element:['','']): Observable<any> {
    // Replace with the actual URL to fetch your data
        const fetchUrl = `http://139.59.221.224:8080/geoserver/${element[0]}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${element[1]}&outputFormat=application/json`;
        return this.http.get(fetchUrl);
    }
  
    convertGeoJSONToWFST(features: FeatureCollection<Geometry, GeoJsonProperties>['features'],dict : string[]): string {
      // const featureType = 'frvk:ply_frv'; // replace with your feature type
      // const xmlns = 'frvk'; // replace with your type name
      // const typeSource = 'frvk:ply_frv'
      // const srsName = 'urn:ogc:def:crs:EPSG::4326'; // replace with your SRS name
  
      let transactionXml = `
       <wfs:Transaction service="WFS" version="1.1.0"
       xmlns:wfs="http://www.opengis.net/wfs"
       xmlns:ogc="http://www.opengis.net/ogc"
       xmlns:gml="http://www.opengis.net/gml"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xsi:schemaLocation="http://www.opengis.net/wfs
                           http://schemas.opengis.net/wfs/1.1.0/wfs.xsd">
  
          <wfs:Insert>
           <${dict[0]+':'+dict[1]} xmlns:${dict[0]}="${dict[0]}">
      `;
  
      features.forEach((feature) => {
  
        if (feature.geometry.type === 'Polygon') {
          transactionXml += `
          <${dict[0]+':'+dict[2]}>
                  ${this.geometryToGml(feature.geometry, dict[3])}
          </${dict[0]+':'+dict[2]}>
        `;
        } else {
          transactionXml += `<${dict[0]+':'+dict[2]}>
          ${this.geometryToGml(feature.geometry, dict[3])}
          </${dict[0]+':'+dict[2]}>`;
        }
      });
  
      transactionXml += `
      </${dict[0]+':'+dict[1]}>
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
        const coordinates = geometry.coordinates.map(coord => coord.reverse().join(',')).join(' ');
        return `<gml:LineString srsName="${srsName}">
          <gml:coordinates>${coordinates}
          </gml:coordinates>
        </gml:LineString>`;
      } else if (geometry.type === 'Polygon') {
        const coordinates = geometry.coordinates[0].map(coord => coord.reverse().join(',')).join(' ');
        return `<gml:Polygon srsName="${srsName}">
             <gml:exterior>
              <gml:LinearRing>
                <gml:coordinates>${coordinates}
                </gml:coordinates>
              </gml:LinearRing>
             </gml:exterior>
          </gml:Polygon>`;
      }
      return '';
    }

    
}
