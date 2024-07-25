import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import maplibregl, { Marker, NavigationControl } from 'maplibre-gl';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { SensorData } from '../../models/sensor_data.model';
import { DroneModel, FeatureCollection, Sensor } from '../../models/sensor.model';
import { SharedService } from '../../services/shared.service';
import { Dialog, DialogRef } from '@angular/cdk/dialog';
import { GeoServerService } from '../../services/geoserver.service';
import { AppConst } from '../../models/AppConst';

@Component({
  selector: 'app-drone-motion',
  templateUrl: './drone-motion.component.html',
  styleUrl: './drone-motion.component.css'
})
export class DroneMotionComponent implements OnInit, OnDestroy {
  @ViewChild('myTemplate') myTemplate!: TemplateRef<unknown>;
  constructor(public matDialog: MatDialog, private http: HttpClient, private sharedServie: SharedService,private dialog: Dialog,
    private geoService:GeoServerService
  ) { 
    this.sharedServie.changePage(AppConst.DronePage);
  }
  private map!: maplibregl.Map;
  private markers: { marker: Marker, imgElement: HTMLImageElement }[] = [];
  sensor: Sensor[] = [];
  drone:DroneModel[] =[];
  pathImg = ''  
  lngLat = [100.97515970012046,  12.831584690521908]

  ngOnInit(): void {
    this.mapSetUp();
    this.initialData()
  }

  mapSetUp(){
    this.map = new maplibregl.Map({
      container: 'map',
      style: 'https://api.maptiler.com/maps/b9ce2a02-280d-4a34-a002-37f946992dfa/style.json?key=NRZzdXmGDnNvgNaaF4Ic',
      center: this.lngLat as [number,number], // starting position [lng, lat]
      zoom: 15 // starting zoom
    });
    this.map.addControl(new NavigationControl({}), 'bottom-right')
  }

  initialData() {
    const url = `${this.geoService.GetProxy()}/gis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=drone_images&outputFormat=application/json`;
    this.http.get<FeatureCollection>(url).subscribe(res => {
      // console.log(res);
      this.lngLat = [res.features[0].geometry.coordinates[0],res.features[0].geometry.coordinates[1]]
      
      res.features.forEach(ele => {
        this.drone.push({
          imgPath: `${window.location.hostname}/${ele.properties.image_relpath}`, //${this.geoService.getStringBefore8000(url)}
          title: ele.id,
          coordinates: [ele.geometry.coordinates[0],ele.geometry.coordinates[1]]
        })
      });
      this.setMarkerImgIcon();
      
    });
  }

  getDataSensorFilter(sensor_id: string, sensorData: SensorData[]): Sensor {
    let sensor_marker: Sensor = {
      coordinates: [0,0],
      title: '',
      humanCount: 0,
      vehicleCount: 0,
      otherCount: 0,
      healthStatus: '',
      healthTime: '',
      latestPhotoTime: '',
      latestPhoto: '',
      previousPhotos: []
    }

    let dataFilter = sensorData.filter(x => x.sensor_poi_id === sensor_id);
    if (dataFilter.length > 0) {
      dataFilter = this.sharedServie.sortEventsByDateTime(dataFilter);
       sensor_marker= {
        coordinates: this.getRandomLatLngInThailand(),
        title: dataFilter[0].sensor_name,
        humanCount: 3,
        vehicleCount: 2,
        otherCount: 1,
        healthStatus: 'Good',
        healthTime: '2024-07-12 16:40',
        latestPhotoTime: this.sharedServie.formatDateNoSec(dataFilter[0].dt),
        latestPhoto: `http://${window.location.hostname}/${dataFilter[0].value}`,
        previousPhotos: this.sharedServie.getPhotos(dataFilter)
      }
    }
    return sensor_marker;
  }


  

  getRandomLatLngInThailand(): [number, number] {
    const minLat = 5.61;
    const maxLat = 20.46;
    const minLng = 97.35;
    const maxLng = 105.64;

    const lat = Math.random() * (maxLat - minLat) + minLat;
    const lng = Math.random() * (maxLng - minLng) + minLng;

    return [lng,lat];
  }

  
  //#region  marker 
  setMarkerImgIcon() {
    this.drone.forEach(markerData => {
      const imgElement = document.createElement('img');
      imgElement.src = markerData.imgPath;
      imgElement.alt = markerData.title;
      this.setMarkerImageSize(imgElement, this.map.getZoom());
      imgElement.style.width = '30px';
      imgElement.style.height = '30px';
      imgElement.style.cursor = 'pointer';
      imgElement.style.border = '2px solid #FFFFFF';
      imgElement.style.borderRadius = '30%';
      // imgElement.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.5)';

      const marker = new Marker({ element: imgElement })
        .setLngLat(markerData.coordinates)
        .addTo(this.map);

      this.markers.push({ marker, imgElement });

      marker.getElement().addEventListener('click', (event) => {
        this.openDialog(this.myTemplate);
        const imgElement = event.currentTarget as HTMLImageElement;
        this.pathImg=imgElement.src;
        // console.log(imgElement.src); // Log the src attribute of the img element
        
      });
    });

    this.map.on('zoom', () => {
      const zoomLevel = this.map.getZoom();
      this.markers.forEach(({ imgElement }) => {
        this.setMarkerImageSize(imgElement, zoomLevel);
      });
    });
  }

  myDialogRef: DialogRef<unknown, any> | undefined;
  openDialog(template: TemplateRef<unknown>) {
    // you can pass additional params, choose the size and much more
    this.myDialogRef = this.dialog.open(template);
  }
  private setMarkerImageSize(imgElement: HTMLImageElement, zoomLevel: number): void {
    const size = Math.max(20, 20 * (zoomLevel / 7));
    imgElement.style.width = `${size}px`;
    imgElement.style.height = `${size}px`;
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
  //#endregion

}
