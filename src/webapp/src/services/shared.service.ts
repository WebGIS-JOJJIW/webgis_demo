import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SensorData } from '../models/sensor_data.model';
import { Photo } from '../models/sensor.model';
import { MarkerDetailsData, SensorDialogComponent } from '../app/sensor-dialog/sensor-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private messagePageChange = new BehaviorSubject<string>('livemonitor');
  private messageMode = new BehaviorSubject<string>('draw_point');
  private pageEditorOn = new BehaviorSubject<boolean>(false);
  private ShowLayerComp = new BehaviorSubject<boolean>(false);
  private layersDisplay = new BehaviorSubject<string[]>([]);
  private saveChangeLayer = new BehaviorSubject<boolean>(false);
  private layerConf = new BehaviorSubject<boolean>(false);
  private dialogOpen = new BehaviorSubject<string>('');
  currentMessage = this.messagePageChange.asObservable();
  currentMode = this.messageMode.asObservable();
  currentPageOn = this.pageEditorOn.asObservable();
  currentShowLayerComp = this.ShowLayerComp.asObservable();
  currentLayersDisplay = this.layersDisplay.asObservable();
  currentSaveChangeLayer = this.saveChangeLayer.asObservable();
  currentLayerConf = this.layerConf.asObservable();
  currentDialogOpen = this.dialogOpen.asObservable();

  private sensorDataSource = new BehaviorSubject<MarkerDetailsData>({
    title: '',
    humanCount: 0,
    vehicleCount: 0,
    otherCount: 0,
    healthStatus: '',
    healthTime: '',
    latestPhotoTime: '',
    latestPhoto: '',
    previousPhotos: [],
    coordinates: [0, 0],
  });

  currentSensorData = this.sensorDataSource.asObservable();

  updateSensorData(data: MarkerDetailsData): void {
    this.sensorDataSource.next(data);
  }

  changeMessage(message: string) {
    this.messagePageChange.next(message);
  }

  changeMode(mode: string){
    this.messageMode.next(mode);
  }

  TurnOnOrOff(sw : boolean){
    this.pageEditorOn.next(sw);
    // if(!sw){this.ShowLayerComp.next(sw);}
  }

  setFlagLayerConf(sw : boolean){
    this.layerConf.next(sw);
  }

  ChangeShowLayerComp(sw : boolean){
    this.ShowLayerComp.next(sw);
  }

  onSaveChangeLayer(sw: boolean){
    this.saveChangeLayer.next(sw);
  }

  setLayersDisplay(res: string[] =['']){
    this.layersDisplay.next(res);
  }

  setCloseAll(){
    this.layerConf.next(false);
    this.pageEditorOn.next(false);
    this.ShowLayerComp.next(false);
  }

  sortEventsByDateTime(data: SensorData[]): SensorData[] {
    data.sort((a, b) => {
      const dateA = new Date(a.dt).getTime();
      const dateB = new Date(b.dt).getTime();
      return dateB - dateA; // Sort in descending order, change to dateA - dateB for ascending
    });

    return data;
  }

  getPhotos(res: SensorData[]): Photo[] {
    let photo: Photo[] = [];
    res.forEach((value, index) => {
      if (index != 0 && index <= 3) {
        photo.push({
          url: `http://${window.location.hostname}/${value.value}`,
          time:this.formatDateNoSec(value.dt),
          by: value.sensor_name
        });
      }
    });
    return photo;
  }

  getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  formatDate(dateStr: string): string {
    // console.log(dateStr);

    const date = new Date(dateStr);
    const year = date.getUTCFullYear();
    const month = ('0' + (date.getUTCMonth() + 1)).slice(-2);
    const day = ('0' + date.getUTCDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getUTCMinutes()).slice(-2);
    const seconds = ('0' + date.getUTCSeconds()).slice(-2);

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  formatDateNoSec(dateStr: string): string {
    // console.log(dateStr);

    const date = new Date(dateStr);
    const year = date.getUTCFullYear();
    const month = ('0' + (date.getUTCMonth() + 1)).slice(-2);
    const day = ('0' + date.getUTCDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getUTCMinutes()).slice(-2);
    // const seconds = ('0' + date.getUTCSeconds()).slice(-2);

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  }

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

  openDialog(data: MarkerDetailsData,dialog:MatDialog): void {
    // console.log(data.title);
    this.sensorDataSource.next(data);
    this.dialogOpen.next(data.title);
    dialog.open(SensorDialogComponent, {
      width: '420px',
      height: '780px',
      data: data,
      position: { top: '80px', right: '5px' },
      hasBackdrop: false,
      
    });
  }
  
}
