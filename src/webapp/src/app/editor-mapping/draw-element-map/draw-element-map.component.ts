import { Component, OnInit } from '@angular/core';
import { Layer_List } from '../../../models/layer.model';

@Component({
  selector: 'app-draw-element-map',
  templateUrl: './draw-element-map.component.html',
  styleUrl: './draw-element-map.component.css'
})
export class DrawElementMapComponent implements OnInit {
  layers: Layer_List[] = [
    {
      name: 'SENSOR CAM1',
      zone: 'Zone001',
      type: 'Camera POI',
      subtype: 'Static Point'
    },
    {
      name: 'SENSOR COMM1',
      zone: 'Zone001',
      type: 'Communication POI',
      subtype: 'Static Point'
    }
  ];

  constructor() {}

  ngOnInit(): void {}
}
