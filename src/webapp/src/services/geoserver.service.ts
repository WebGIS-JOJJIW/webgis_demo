import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, ObservableInput, map } from 'rxjs';
import { FeatureCollection, GeoJsonProperties, Geometry } from 'geojson';
import { MatDialog } from '@angular/material/dialog';
import { SharedService } from './shared.service';
import { InsertLayer, attr } from '../models/geo.model';
import { Layer, LayerResponse } from '../models/layer.model';

@Injectable({
  providedIn: 'root'
})
export class GeoServerService {


  private proxy = `http://${window.location.hostname}:8000/geoserver`;
  // private proxy = `http://167.172.94.39:8000/geoserver`; 

  constructor(private http: HttpClient,
    private dialog: MatDialog, private shareService: SharedService) { }

  pushData(payload: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa('admin:geoserver')
      })
    };

    // console.log(httpOptions);
    // console.log('Basic ' + btoa('admin:geoserver'));
    return this.http.post(this.proxy + '/wfs', payload, httpOptions);
  }


  InsertLayer(payload: string, workspace: string, db: string): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa('admin:geoserver')
      })
    };
    // console.log('Basic ' + btoa('admin:geoserver'));
    const url = `${this.proxy}/rest/workspaces/${workspace}/datastores/${db}/featuretypes/`
    return this.http.post(url, payload, httpOptions);
  }

  getLayerListApi(): Observable<LayerResponse> {
    const url = `${this.proxy}/rest/layers?Accept=application/json`
    return this.http.get<LayerResponse>(url);
  }

  getLayerDetails(url: string): Observable<any> {
    // const url = `${this.proxy}/rest/layers?Accept=application/json`
    return this.http.get<any>(url);
  }

  getAbstract(layerName: string): Observable<string> {
    const url = `${this.proxy}/rest/workspaces/gis/datastores/gis_db/featuretypes/${layerName}.json`;
    return this.http.get<any>(url).pipe(
      map((res: any) => res.featureType.abstract)
    );
  }

  convertGeoJSONToWFST(features: FeatureCollection<Geometry, GeoJsonProperties>['features'], dict: string[]): string {
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
           <${dict[0] + ':' + dict[1]} xmlns:${dict[0]}="${dict[0]}">
      `;

    features.forEach((feature) => {

      if (feature.geometry.type === 'Polygon') {
        transactionXml += `
          <${dict[0] + ':' + dict[2]}>
                  ${this.geometryToGml(feature.geometry, dict[3])}
          </${dict[0] + ':' + dict[2]}>
        `;
      } else {
        transactionXml += `<${dict[0] + ':' + dict[2]}>
          ${this.geometryToGml(feature.geometry, dict[3])}
          </${dict[0] + ':' + dict[2]}>`;
      }
    });
    //<gis:name>Sensor002</gis:name>
    //<gis:vector_type>STANDARD_POI</gis:vector_type>
    transactionXml += `
      <gis:name>sensor2</gis:name>
      <gis:vector_type>standard_poi</gis:vector_type>
      </${dict[0] + ':' + dict[1]}>
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

  xmlInsertLayerToPayload(response: InsertLayer): string {
    console.log(response);

    var res = `{
      "featureType": {
        "name": "${response.layerName}",
        "nativeName": "${response.layerName}",
        "namespace": {
          "name": "${response.workspace}",
          "href": "${this.proxy}/rest/namespaces/${response.workspace}.json"
        },
        "title": "${response.layerName}",
        "abstract": "${response.description}",
        "keywords": {
          "string": [
            "features",
            "${response.layerName}"
          ]
        },
        "nativeCRS": "GEOGCS[\\"WGS 84\\", \\n  DATUM[\\"World Geodetic System 1984\\", \\n    SPHEROID[\\"WGS 84\\", 6378137.0, 298.257223563, AUTHORITY[\\"EPSG\\",\\"7030\\"]], \\n    AUTHORITY[\\"EPSG\\",\\"6326\\"]], \\n  PRIMEM[\\"Greenwich\\", 0.0, AUTHORITY[\\"EPSG\\",\\"8901\\"]], \\n  UNIT[\\"degree\\", 0.017453292519943295], \\n  AXIS[\\"Geodetic longitude\\", EAST], \\n  AXIS[\\"Geodetic latitude\\", NORTH], \\n  AUTHORITY[\\"EPSG\\",\\"4326\\"]]",
        "srs": "EPSG:4326",
        "nativeBoundingBox": {
          "minx": -180,
          "maxx": 180,
          "miny": -90,
          "maxy": 90,
          "crs": "EPSG:4326"
        },
        "latLonBoundingBox": {
          "minx": -180,
          "maxx": 180,
          "miny": -90,
          "maxy": 90,
          "crs": "EPSG:4326"
        },
        "projectionPolicy": "FORCE_DECLARED",
        "enabled": true,
        "store": {
          "@class": "dataStore",
          "name": "${response.workspace}:${response.dbName}",
          "href": "${this.proxy}/rest/workspaces/${response.workspace}/datastores/${response.dbName}.json"
        },
        "serviceConfiguration": false,
        "simpleConversionEnabled": false,
        "internationalTitle": "",
        "internationalAbstract": "",
        "maxFeatures": 0,
        "numDecimals": 0,
        "padWithZeros": false,
        "forcedDecimal": false,
        "overridingServiceSRS": false,
        "skipNumberMatched": false,
        "circularArcPresent": false,`

    res += this.addAttr(response.attr);
    res += ` ]
                }
              }
            }`

    return res;
  }

  addAttr(attr: attr[]): string {
    var text = `"attributes": {
          "attribute": [`
    attr.forEach(res => {
      var type = '"binding": "java.lang.String"'
      if (res.type?.toLowerCase() == 'polygon') {
        type = `"binding": "org.locationtech.jts.geom.Polygon"`
      } else if (res.type?.toLowerCase() == 'point') {
        type = `"binding": "org.locationtech.jts.geom.Point"`
      } else if (res.type?.toLowerCase() == 'polyline') {
        type = `"binding": "org.locationtech.jts.geom.LineString"`
      }
      text += `
      {
        "name": "${res.name}",
        "minOccurs": 0,
        "maxOccurs": 1,
        "nillable": true,
        ${type}
      } `

      if (!(attr[attr.length - 1].name == res.name)) {
        text += `,`
      }
    });
    return text;
  }

  GetProxy(): string {
    return this.proxy;
  }


}
