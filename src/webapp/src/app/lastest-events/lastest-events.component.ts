import { Component } from '@angular/core';

@Component({
  selector: 'app-lastest-events',
  templateUrl: './lastest-events.component.html',
  styleUrl: './lastest-events.component.css'
})
export class LastestEventsComponent {
  events = [
    { dateTime: '2024-06-01 10:14:59', type: 'Alarm', system: 'SENSOR', description: 'Sensor 002 Alarm - Human Detection' },
    { dateTime: '2024-06-01 08:02:40', type: 'Info', system: 'SENSOR', description: 'Sensor Health Check - On' },
    { dateTime: '2024-06-01 07:10:00', type: 'Alarm', system: 'SENSOR', description: 'Sensor 001 Alarm - Vehicle Detection' },
    { dateTime: '2024-06-01 07:04:20', type: 'Alarm', system: 'SENSOR', description: 'Sensor 004 Alarm - Vehicle Detection' },
    { dateTime: '2024-06-01 06:43:41', type: 'Alarm', system: 'SENSOR', description: 'Sensor 002 Alarm - Human Detection' },
    { dateTime: '2024-06-01 06:16:00', type: 'Alarm', system: 'SENSOR', description: 'Sensor 002 Alarm - Human Detection' },
    { dateTime: '2024-06-01 05:05:04', type: 'Info', system: 'SERVER', description: 'Storage Update' },
    { dateTime: '2024-06-01 04:23:38', type: 'Alarm', system: 'SENSOR', description: 'Sensor 003 Alarm - Human Detection' },
  ];

  filter = {
    all: true,
    alarm: true,
    info: true
  };

  filteredEvents = this.events;

  constructor() { }

  ngOnInit(): void {
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.filter.all) {
      this.filteredEvents = this.events;
    } else {
      this.filteredEvents = this.events.filter(event =>
        (this.filter.alarm && event.type === 'Alarm') ||
        (this.filter.info && event.type === 'Info')
      );
    }
  }
}
