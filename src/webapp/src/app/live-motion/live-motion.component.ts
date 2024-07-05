import { Component } from '@angular/core';
import maplibregl, { Marker, NavigationControl } from 'maplibre-gl';
import { MarkerDetailsData, SensorDialogComponent } from '../sensor-dialog/sensor-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-live-motion',
  templateUrl: './live-motion.component.html',
  styleUrl: './live-motion.component.css'
})
export class LiveMotionComponent {
  constructor(private dialog: MatDialog,private sharedService:SharedService) {
    this.dialog.closeAll();
    this.sharedService.TurnOnOrOff(false);
   }
  private map!: maplibregl.Map;
  markers: Marker[] = [];

  ngOnInit(): void { 

    this.map = new maplibregl.Map({
      container: 'map',
      style: 'https://api.maptiler.com/maps/b9ce2a02-280d-4a34-a002-37f946992dfa/style.json?key=NRZzdXmGDnNvgNaaF4Ic',
      center: [101.86863588113442,14.174982274310366], // starting position [lng, lat]
      zoom: 10 // starting zoom
    });
    this.map.addControl(new NavigationControl({}), 'bottom-right')
    this.setMarker()
  }

  //#region  marker 
  setMarker() {

    const markers = [
      {
        coordinates: [101.86863588113442, 14.174982274310366] as [number, number],
        title: 'Sensor 001',
        humanCount: 2,
        vehicleCount: 3,
        otherCount: 1,
        healthStatus: 'Good',
        healthTime: '20 min ago',
        latestPhotoTime: '2024-06-01 12:00',
        latestPhoto: 'https://via.placeholder.com/150',
        previousPhotos: [
          { url: 'https://via.placeholder.com/100', time: '2024-06-01 10:00', by: 'S001.A' },
          { url: 'https://via.placeholder.com/100', time: '2024-05-31 22:00', by: 'S001.B' },
          { url: 'https://via.placeholder.com/100', time: '2024-05-31 22:00', by: 'S001.B' }
        ]

      },
      {
        coordinates: [101.60295866314311, 14.26650329710607] as [number, number],
        title: 'Sensor 001',
        humanCount: 2,
        vehicleCount: 3,
        otherCount: 1,
        healthStatus: 'Good',
        healthTime: '20 min ago',
        latestPhotoTime: '2024-06-01 12:00',
        latestPhoto: 'https://via.placeholder.com/150',
        previousPhotos: [
          { url: 'https://via.placeholder.com/100', time: '2024-06-01 10:00', by: 'S001.A' },
          { url: 'https://via.placeholder.com/100', time: '2024-05-31 22:00', by: 'S001.B' },
          { url: 'https://via.placeholder.com/100', time: '2024-05-31 22:00', by: 'S001.B' }
        ]
      },
      {
        coordinates: [101.76983030419524, 14.059996601554488] as [number, number],
        title: 'Sensor 001',
        humanCount: 2,
        vehicleCount: 3,
        otherCount: 1,
        healthStatus: 'Good',
        healthTime: '20 min ago',
        latestPhotoTime: '2024-06-01 12:00',
        latestPhoto: 'https://via.placeholder.com/150',
        previousPhotos: [
          { url: 'https://via.placeholder.com/100', time: '2024-06-01 10:00', by: 'S001.A' },
          { url: 'https://via.placeholder.com/100', time: '2024-05-31 22:00', by: 'S001.B' },
          { url: 'https://via.placeholder.com/100', time: '2024-05-31 22:00', by: 'S001.B' }
        ]
      },
    ]

    markers.forEach(markerData => {

      const marker = new Marker({
        color: 'red', // optional color property if you are using custom colored marker imagesxs
        draggable: true
      })
      marker.setLngLat(markerData.coordinates)
      marker.addTo(this.map);
      this.markers.push(marker);

      marker.getElement().addEventListener('click', () => {
        this.openDialog(markerData as MarkerDetailsData);
      });
    });
  }

  openDialog(data: MarkerDetailsData): void {
    this.dialog.open(SensorDialogComponent, {
      width: '450px',
      height: '100%',
      data: data,
      position: { top: '80px', right: '0' }
    });
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
  //#endregion

  
}
