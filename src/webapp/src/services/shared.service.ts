import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SensorData } from '../models/sensor_data.model';
import { Photo } from '../models/sensor.model';
import { MarkerDetailsData, SensorDialogComponent } from '../app/sensor-dialog/sensor-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Layer, Layer_List, LayerDisplay } from '../models/layer.model';

@Injectable({
  providedIn: 'root'
})
export class SharedService {

  //#region parameters
  private PageOnChange = new BehaviorSubject<string>('live');
  private messageMode = new BehaviorSubject<string>('');
  private pageEditorOn = new BehaviorSubject<boolean>(false);
  private ShowLayerComp = new BehaviorSubject<boolean>(false);
  private layersDisplay = new BehaviorSubject<LayerDisplay[]>([]);
  private saveChangeLayer = new BehaviorSubject<boolean>(false);
  private layerConf = new BehaviorSubject<boolean>(false);
  private dialogOpen = new BehaviorSubject<string>('');
  private layer = new BehaviorSubject<Layer_List>(new Layer_List)
  private activeLayerEditor = new BehaviorSubject<boolean>(false);

  private activeEdit = new BehaviorSubject<boolean>(false);   //accept to add new element on map
  private activeSave = new BehaviorSubject<boolean>(false);  //save to element api geoserver
  private layerAfterSave = new BehaviorSubject<string>('');  //when add new layer used for get layer for edit 
  currentActiveEdit = this.activeEdit.asObservable();
  currentActiveSave = this.activeSave.asObservable();
  currentLayerAfterSave = this.layerAfterSave.asObservable();

  private activeEventFull = new BehaviorSubject<boolean>(false);   // active event full page on live 
  currentActiveEventFull = this.activeEventFull.asObservable();

  private activeAllowDraw = new BehaviorSubject<boolean>(true);  //  use for highlight icon on drawtools 
  currentActiveAllowDraw = this.activeAllowDraw.asObservable();
  
  currentPageLive = this.PageOnChange.asObservable();
  currentMode = this.messageMode.asObservable();
  currentPageOn = this.pageEditorOn.asObservable();
  currentShowLayerComp = this.ShowLayerComp.asObservable();
  currentLayersDisplay = this.layersDisplay.asObservable();
  currentSaveChangeLayer = this.saveChangeLayer.asObservable();
  currentLayerConf = this.layerConf.asObservable();
  currentDialogOpen = this.dialogOpen.asObservable();
  currentLayer = this.layer.asObservable();
  currentActiveLayerEditor = this.activeLayerEditor.asObservable();
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


  //flag item 
  private isPoint = new BehaviorSubject<boolean>(false);
  private isPolygon = new BehaviorSubject<boolean>(false);
  private isPolyline = new BehaviorSubject<boolean>(false);

  currentIsPoint = this.isPoint.asObservable();
  currentIsPolygon = this.isPolygon.asObservable();
  currentIsPolyline = this.isPolyline.asObservable();

  //#endregion
  updateSensorData(data: MarkerDetailsData): void {
    this.sensorDataSource.next(data);
  }

  setEventActiveFull(sw :boolean){
    this.activeEventFull.next(sw);
  }

  setActiveAllowDraw(sw:boolean){
    this.activeAllowDraw.next(sw);
  }

  changePage(message: string) {
    this.PageOnChange.next(message);
  }

  changeMode(mode: string){
    this.messageMode.next(mode);
  }

  setActiveSave(sw:boolean){
    this.activeSave.next(sw);
  }

  setActiveEdit(sw:boolean){
    this.activeEdit.next(sw);
  }

  TurnOnOrOff(sw : boolean){
    this.pageEditorOn.next(sw);
    // if(!sw){this.ShowLayerComp.next(sw);}
  }

  setLayerAfterSaved(name:string){
    console.log(name);
    
    this.layerAfterSave.next(name);
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

  setLayersDisplay(res: LayerDisplay[]){
    this.layersDisplay.next(res);
  }

  setLayer(data: Layer_List){
    this.layer.next(data);
  }

  setCloseAll(){
    this.layerConf.next(false);
    this.pageEditorOn.next(false);
    this.ShowLayerComp.next(false);
  }

  setActiveLayerEditor(sw : boolean){
    this.activeLayerEditor.next(sw);
  }

  setIsMode(mode:string){
    if(mode==='draw_point'){
      this.isPoint.next(true);
      this.isPolygon.next(false);
      this.isPolyline.next(false);
    }else if(mode ==='draw_polygon'){
      this.isPoint.next(false);
      this.isPolygon.next(true);
      this.isPolyline.next(false);
    }else if(mode == 'draw_line_string'){
      this.isPoint.next(false);
      this.isPolygon.next(false);
      this.isPolyline.next(true);
    }
    
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
          time:this.formatDate(value.dt),
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
