import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as ActionCable from '@rails/actioncable';

@Injectable({
  providedIn: 'root'
})
export class SensorDataService {
  private cable: any;
  private sensorDataMainChannel: any;
  private sensorDataChannel1: any;
  
  constructor() {
    this.cable = ActionCable.createConsumer(`ws://${window.location.hostname}:1337/cable`);
  }

  subscribeToMainChannel(): Observable<any> {
    return new Observable(observer => {
      this.sensorDataMainChannel = this.cable.subscriptions.create({ channel: 'SensorDataChannel' }, {
        connected: () => {
          console.log('Connected to the sensor_data channel');
        },
        disconnected: () => {
          console.log('Disconnected from the sensor_data channel');
        },
        received: (data: any) => {
          observer.next(data);
        }
      });
    });
  }

  subscribeToSensorChannel(sensor_id: number): Observable<any> {
    return new Observable(observer => {
      this.sensorDataChannel1 = this.cable.subscriptions.create({ channel: 'SensorDataChannel', sensor_id: sensor_id }, {
        connected: () => {
          console.log(`Connected to the sensor:${sensor_id}:sensor_data channel`);
        },
        disconnected: () => {
          console.log(`Disconnected from the sensor:${sensor_id}:sensor_data channel`);
        },
        received: (data: any) => {
          observer.next(data);
        }
      });
    });
  }
}
