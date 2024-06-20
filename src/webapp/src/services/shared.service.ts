import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  private messagePageChange = new BehaviorSubject<string>('livemonitor');
  currentMessage = this.messagePageChange.asObservable();

  changeMessage(message: string) {
    this.messagePageChange.next(message);
  }
}
