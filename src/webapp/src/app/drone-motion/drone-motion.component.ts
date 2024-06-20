import { Component } from '@angular/core';
import maplibregl, { Marker, NavigationControl } from 'maplibre-gl';
<<<<<<< HEAD
=======
import { MarkerDetailsData, SensorDialogComponent } from '../sensor-dialog/sensor-dialog.component';
import { MatDialog } from '@angular/material/dialog';
>>>>>>> webgis_ui_frank_01

@Component({
  selector: 'app-drone-motion',
  templateUrl: './drone-motion.component.html',
  styleUrl: './drone-motion.component.css'
})
export class DroneMotionComponent {
<<<<<<< HEAD
  constructor() { }
  private map!: maplibregl.Map;
  markers: Marker[] = [];

  ngOnInit(): void { 
=======
  constructor(public dialog: MatDialog) { }
  private map!: maplibregl.Map;
  private markers: { marker: Marker, imgElement: HTMLImageElement }[] = [];
  private selectedLayerId: string | null = null;
  ngOnInit(): void {
>>>>>>> webgis_ui_frank_01

    this.map = new maplibregl.Map({
      container: 'map',
      style: 'https://api.maptiler.com/maps/b9ce2a02-280d-4a34-a002-37f946992dfa/style.json?key=NRZzdXmGDnNvgNaaF4Ic',
<<<<<<< HEAD
      center: [101.86863588113442,14.174982274310366], // starting position [lng, lat]
      zoom: 10 // starting zoom
    });
    this.map.addControl(new NavigationControl({}), 'bottom-right')
  }

  // setMarkerImg() {

  //   const markers = [
  //     {
  //       coordinates: [101.86863588113442, 14.174982274310366] as [number, number],
  //       title: 'Sensor 001',
  //       humanCount: 2,
  //       vehicleCount: 3,
  //       otherCount: 1,
  //       healthStatus: 'Good',
  //       healthTime: '20 min ago',
  //       latestPhotoTime: '2024-06-01 12:00',
  //       latestPhoto: 'https://via.placeholder.com/150',
  //       previousPhotos: [
  //         { url: 'https://via.placeholder.com/100', time: '2024-06-01 10:00', by: 'S001.A' },
  //         { url: 'https://via.placeholder.com/100', time: '2024-05-31 22:00', by: 'S001.B' },
  //         { url: 'https://via.placeholder.com/100', time: '2024-05-31 22:00', by: 'S001.B' }
  //       ]

  //     },
  //     {
  //       coordinates: [101.60295866314311, 14.26650329710607] as [number, number],
  //       title: 'Sensor 001',
  //       humanCount: 2,
  //       vehicleCount: 3,
  //       otherCount: 1,
  //       healthStatus: 'Good',
  //       healthTime: '20 min ago',
  //       latestPhotoTime: '2024-06-01 12:00',
  //       latestPhoto: 'https://via.placeholder.com/150',
  //       previousPhotos: [
  //         { url: 'https://via.placeholder.com/100', time: '2024-06-01 10:00', by: 'S001.A' },
  //         { url: 'https://via.placeholder.com/100', time: '2024-05-31 22:00', by: 'S001.B' },
  //         { url: 'https://via.placeholder.com/100', time: '2024-05-31 22:00', by: 'S001.B' }
  //       ]
  //     },
  //     {
  //       coordinates: [101.76983030419524, 14.059996601554488] as [number, number],
  //       title: 'Sensor 001',
  //       humanCount: 2,
  //       vehicleCount: 3,
  //       otherCount: 1,
  //       healthStatus: 'Good',
  //       healthTime: '20 min ago',
  //       latestPhotoTime: '2024-06-01 12:00',
  //       latestPhoto: 'https://via.placeholder.com/150',
  //       previousPhotos: [
  //         { url: 'https://via.placeholder.com/100', time: '2024-06-01 10:00', by: 'S001.A' },
  //         { url: 'https://via.placeholder.com/100', time: '2024-05-31 22:00', by: 'S001.B' },
  //         { url: 'https://via.placeholder.com/100', time: '2024-05-31 22:00', by: 'S001.B' }
  //       ]
  //     },
  //   ]

  //   markers.forEach(markerData => {
  //     const popupContent = `
  //       <div class="popup-card">
  //         <h3>${markerData.title}</h3>
  //         <p>${1}</p>
  //         <img src="${markerData.latestPhoto}" alt="${markerData.title}" style="width: 100%;">
  //       </div>
  //     `;

  //     // const popup = new Popup({ offset: 25 }).setHTML(popupContent);

  //     const imgElement = document.createElement('img');
  //     imgElement.src = markerData.latestPhoto;
  //     imgElement.alt = markerData.title;
  //     this.setMarkerImageSize(imgElement, this.map.getZoom());
  //     imgElement.style.width = '50px';
  //     imgElement.style.height = '50px';
  //     imgElement.style.cursor = 'pointer';
  //     imgElement.style.border = '2px solid #FFFFFF';
  //     imgElement.style.borderRadius = '30%';
  //     imgElement.style.boxShadow = '0 0 5px rgba(0, 0, 0, 0.5)';

  //     const marker = new Marker({ element: imgElement })
  //       .setLngLat(markerData.coordinates)
  //       // .setPopup(popup)
  //       .addTo(this.map);


  //     this.markers.push({ marker, imgElement });

  //     marker.getElement().addEventListener('click', () => {
  //       // console.log('click openlog');

  //       this.openDialog(markerData as MarkerDetailsData);
  //     });

  //   });

  //   this.map.on('zoom', () => {
  //     const zoomLevel = this.map.getZoom();
  //     this.markers.forEach(({ imgElement }) => {
  //       this.setMarkerImageSize(imgElement, zoomLevel);
  //     });
  //   });
  // }
=======
      center: [101.86863588113442, 14.174982274310366], // starting position [lng, lat]
      zoom: 10 // starting zoom
    });
    this.map.addControl(new NavigationControl({}), 'bottom-right')
    this.setMarkerImgIcon();
  }
  //#region  marker 
  setMarkerImgIcon() {

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
      const popupContent = `
      <div class="popup-card">
        <h3>${markerData.title}</h3>
        <p>${1}</p>
        <img src="${markerData.latestPhoto}" alt="${markerData.title}" style="width: 100%;">
      </div>
    `;

      // const popup = new Popup({ offset: 25 }).setHTML(popupContent);

      const imgElement = document.createElement('img');
      imgElement.src = markerData.latestPhoto;
      imgElement.alt = markerData.title;
      this.setMarkerImageSize(imgElement, this.map.getZoom());
      imgElement.style.width = '50px';
      imgElement.style.height = '50px';
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
>>>>>>> webgis_ui_frank_01

  private setMarkerImageSize(imgElement: HTMLImageElement, zoomLevel: number): void {
    const size = Math.max(30, 50 * (zoomLevel / 7));
    imgElement.style.width = `${size}px`;
    imgElement.style.height = `${size}px`;
  }

<<<<<<< HEAD
=======
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


>>>>>>> webgis_ui_frank_01
}
