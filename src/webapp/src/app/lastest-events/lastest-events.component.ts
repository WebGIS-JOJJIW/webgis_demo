import { Component, TemplateRef } from '@angular/core';
import { SensorDataService } from '../../services/sensor-data.service';
import { HttpClient } from '@angular/common/http';
import { SensorData, Event as events } from '../../models/sensor_data.model';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Dialog, DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-lastest-events',
  templateUrl: './lastest-events.component.html',
  styleUrl: './lastest-events.component.css'
})
export class LastestEventsComponent {
  constructor(private sensorDataService: SensorDataService, private http: HttpClient,private route: ActivatedRoute,private dialog: Dialog) { }
  sensorData: SensorData[] = [];
  // sensorSpecificData: any[] = [];
  sensor_id = 1; // This is the sensor_id that we want to subscribe to
  events: events[] = [];
  isCollapsed = true;

  filter = {
    all: true,
    alarm: true,
    info: true
  };

  filteredEvents = this.events;
  ActiveFull = false;

  ngOnInit(): void {
    // this.applyFilter();
    this.initialData();
    this.sensorDataService.subscribeToMainChannel().subscribe(data => {
      this.http.get<SensorData[]>(`http://${window.location.hostname}:3001/sensor_data`).subscribe(res => {
        if(this.ActiveFull){
          this.events = res.map(sensorData => this.mapSensorDataToEventThumbs(sensorData));
        }else{
          this.events = res.map(sensorData => this.mapSensorDataToEvent(sensorData));
        }
        this.refreshData();
      });
    });
    // ActiveFull
    this.route.params.subscribe(params => {
      this.ActiveFull = params['flag']; 
   });
  }

  initialData(): void {
    this.http.get<SensorData[]>(`http://${window.location.hostname}:3001/sensor_data`).subscribe(res => {
      // console.log('res',res.filter(x=>x.sensor_poi_id === 'sensor001'));
      if(this.ActiveFull){
        this.events = res.map(sensorData => this.mapSensorDataToEventThumbs(sensorData));
      }else{
        this.events = res.map(sensorData => this.mapSensorDataToEvent(sensorData));
      }
      
      this.sortEventsByDateTime();
      this.applyFilter();
    });
  }


  refreshData(): void {
    this.http.get<SensorData[]>(`http://${window.location.hostname}:3001/sensor_data`).subscribe(res => {
      if(this.ActiveFull){
        this.events = res.map(sensorData => this.mapSensorDataToEventThumbs(sensorData));
      }else{
        this.events = res.map(sensorData => this.mapSensorDataToEvent(sensorData));
      }
      this.sortEventsByDateTime();
      this.applyFilter();
    });
  }

  mapSensorDataToEvent(sensorData: SensorData): events {
    // let date = new Date(sensorData.dt).toLocaleString()
    return {
      dateTime: this.formatDate(sensorData.dt),
      type: 'Alarm', // Assume 'Alarm' for this example, adjust as necessary
      system: 'SENSOR',
      sensorName: `${sensorData.sensor_name}`,
      description: `<${sensorData.sensor_name}>  Alarm (${sensorData.sensor_type_name}) - ${sensorData.value} `
    };
  }

  mapSensorDataToEventThumbs(sensorData: SensorData): events {
    // let date = new Date(sensorData.dt).toLocaleString()
    return {
      dateTime: this.formatDate(sensorData.dt),
      type: 'Alarm', // Assume 'Alarm' for this example, adjust as necessary
      system: 'SENSOR',
      sensorName: `${sensorData.sensor_name}`,
      description: `http://${window.location.hostname}/${sensorData.value}`
    };
  }

  getEventType(sensorData: SensorData): string {
    // Logic to determine the event type based on sensor data
    // For this example, assume all are 'Alarm'
    return 'Alarm';
  }

  applyFilter(strName : string = 'all'): void {
  
    if((this.filter.alarm && this.filter.info) && this.filter.all){
      this.filteredEvents = this.events.filter(event =>
        (this.filter.alarm && event.type === 'Alarm')||
        (this.filter.info && event.type === 'Info')
      );
    }
    else if((this.filter.alarm && this.filter.info) && !this.filter.all){
      this.filter.all = true;
      this.filteredEvents = this.events.filter(event =>
        (this.filter.alarm && event.type === 'Alarm')||
        (this.filter.info && event.type === 'Info')
      );
    }else if ((this.filter.alarm || this.filter.info)&& this.filter.all && strName === 'all'){
      this.filter.alarm = true;
      this.filter.info = true;
      this.filteredEvents = this.events.filter(event =>
        (this.filter.alarm && event.type === 'Alarm')||
        (this.filter.info && event.type === 'Info')
      );
    }
    else if (this.filter.alarm && !this.filter.info && this.filter.all){
      this.filter.all = false;
      this.filteredEvents = this.events.filter(event =>
        (this.filter.alarm && event.type === 'Alarm')
      );
    }else if(!this.filter.alarm && this.filter.info && this.filter.all){
      this.filter.all = false;
      this.filteredEvents = this.events.filter(event =>
        (this.filter.info && event.type === 'Info')
      );
    }

  }

  formatDate(dateStr: string): string {
    // console.log(dateStr);

    const date = new Date(dateStr);
    const year = date.getUTCFullYear();
    const month = ('0' + (date.getUTCMonth() + 1)).slice(-2);
    const day = ('0' + date.getUTCDate()).slice(-2);
    const hours = ('0' + date.getUTCHours()).slice(-2);
    const minutes = ('0' + date.getUTCMinutes()).slice(-2);
    const seconds = ('0' + date.getUTCSeconds()).slice(-2);

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  sortEventsByDateTime(): void {
    this.events.sort((a, b) => {
      const dateA = new Date(a.dateTime).getTime();
      const dateB = new Date(b.dateTime).getTime();
      return dateB - dateA; // Sort in descending order, change to dateA - dateB for ascending
    });
  }


  toggleHeight(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  myDialogRef: DialogRef<unknown, any> | undefined;

  openDialog(template: TemplateRef<unknown>) {
    // you can pass additional params, choose the size and much more
    this.myDialogRef = this.dialog.open(template);
  }
}
