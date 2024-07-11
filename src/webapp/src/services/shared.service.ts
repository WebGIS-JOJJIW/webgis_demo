import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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
  currentMessage = this.messagePageChange.asObservable();
  currentMode = this.messageMode.asObservable();
  currentPageOn = this.pageEditorOn.asObservable();
  currentShowLayerComp = this.ShowLayerComp.asObservable();
  currentLayersDisplay = this.layersDisplay.asObservable();
  currentSaveChangeLayer = this.saveChangeLayer.asObservable();
  currentLayerConf = this.layerConf.asObservable();

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



  getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  
}
