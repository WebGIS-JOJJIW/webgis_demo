import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private messagePageChange = new BehaviorSubject<string>('livemonitor');
  private messageMode = new BehaviorSubject<string>('draw_point');
  private pageEditorOn = new BehaviorSubject<boolean>(false);
  currentMessage = this.messagePageChange.asObservable();
  currentMode = this.messageMode.asObservable();
  currentPageOn = this.pageEditorOn.asObservable();

  changeMessage(message: string) {
    this.messagePageChange.next(message);
  }

  changeMode(mode: string){
    this.messageMode.next(mode);
  }

  TurnOnOrOff(sw : boolean){
    this.pageEditorOn.next(sw);
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
