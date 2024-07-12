import { Component } from '@angular/core';
import maplibregl, { Marker, NavigationControl } from 'maplibre-gl';
import { MarkerDetailsData, SensorDialogComponent } from '../sensor-dialog/sensor-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { SensorData } from '../../models/sensor_data.model';
import { Photo, Sensor } from '../../models/sensor.model';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-drone-motion',
  templateUrl: './drone-motion.component.html',
  styleUrl: './drone-motion.component.css'
})
export class DroneMotionComponent {
  constructor(public dialog: MatDialog, private http: HttpClient, private sharedServie: SharedService) { }
  private map!: maplibregl.Map;
  private markers: { marker: Marker, imgElement: HTMLImageElement }[] = [];
  private selectedLayerId: string | null = null;
  sensor: Sensor[] = [];
  

  ngOnInit(): void {
    this.initialData()
    this.map = new maplibregl.Map({
      container: 'map',
      style: 'https://api.maptiler.com/maps/b9ce2a02-280d-4a34-a002-37f946992dfa/style.json?key=NRZzdXmGDnNvgNaaF4Ic',
      center: [101.86863588113442, 14.174982274310366], // starting position [lng, lat]
      zoom: 6 // starting zoom
    });
    this.map.addControl(new NavigationControl({}), 'bottom-right')
    

  }

  initialData() {
    this.http.get<SensorData[]>(`http://${window.location.hostname}:3001/sensor_data`).subscribe(res => {
      // this.events = res.map(sensorData => this.mapSensorDataToEvent(sensorData));
      let filteredSensorData: SensorData[] = [];
      filteredSensorData = this.filterUniqueSensorPoiId(res);
      // console.log('filteredSensorData : ', filteredSensorData);
      // this.getDataSensorFilter('sensor001', res);
      filteredSensorData.forEach(ele => {
        this.sensor.push(this.getDataSensorFilter(ele.sensor_poi_id,res))
      });

      // console.log('sensor :',this.sensor);
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
      dataFilter = this.sortEventsByDateTime(dataFilter);
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
        previousPhotos: this.getPhotos(dataFilter)
      }
    }
    return sensor_marker;
  }

  getPhotos(res: SensorData[]): Photo[] {
    let photo: Photo[] = [];
    res.forEach((value, index) => {
      if (index != 0 && index <= 3) {
        photo.push({
          url: `http://${window.location.hostname}/${value.value}`,
          time: value.dt,
          by: value.sensor_name
        });
      }
    });
    return photo;
  }

  sortEventsByDateTime(data: SensorData[]): SensorData[] {
    data.sort((a, b) => {
      const dateA = new Date(a.dt).getTime();
      const dateB = new Date(b.dt).getTime();
      return dateB - dateA; // Sort in descending order, change to dateA - dateB for ascending
    });

    return data;
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

    this.sensor.forEach(markerData => {

      const imgElement = document.createElement('img');
      imgElement.src = markerData.latestPhoto;
      imgElement.alt = markerData.title;
      this.setMarkerImageSize(imgElement, this.map.getZoom());
      imgElement.style.width = '30px';
      imgElement.style.height = '30px';
      imgElement.style.cursor = 'pointer';
      imgElement.style.border = '2px solid #FFFFFF';
      imgElement.style.borderRadius = '30%';
      imgElement.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.5)';


      const marker = new Marker({ element: imgElement })
        .setLngLat(markerData.coordinates)
        // .setPopup(popup)
        .addTo(this.map);


      this.markers.push({ marker, imgElement });

      marker.getElement().addEventListener('click', () => {
        // console.log('click openlog');

        this.openDialog(markerData as MarkerDetailsData);
      });

    });

    this.map.on('zoom', () => {
      const zoomLevel = this.map.getZoom();
      this.markers.forEach(({ imgElement }) => {
        this.setMarkerImageSize(imgElement, zoomLevel);
      });
    });
  }

  private setMarkerImageSize(imgElement: HTMLImageElement, zoomLevel: number): void {
    const size = Math.max(30, 50 * (zoomLevel / 7));
    imgElement.style.width = `${size}px`;
    imgElement.style.height = `${size}px`;
  }

  openDialog(data: MarkerDetailsData): void {
    this.dialog.open(SensorDialogComponent, {
      width: '420px',
      height: '800px',
      data: data,
      position: { top: '80px', right: '0' },
      hasBackdrop: false,
    });
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
  //#endregion

  filterUniqueSensorPoiId(data: SensorData[]): SensorData[] {
    const uniqueSensorPoiIds = new Set<string>();
    return data.filter(item => {
      if (!uniqueSensorPoiIds.has(item.sensor_poi_id)) {
        uniqueSensorPoiIds.add(item.sensor_poi_id);
        return true;
      }
      return false;
    });
  }
}
