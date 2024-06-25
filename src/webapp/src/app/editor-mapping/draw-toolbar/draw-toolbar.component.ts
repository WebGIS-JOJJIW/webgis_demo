import { Component } from '@angular/core';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import mapboxgl from 'mapbox-gl';
import maplibregl from 'maplibre-gl';
import MapboxDrawControl from './MapboxDrawControl';

@Component({
  selector: 'app-draw-toolbar',
  templateUrl: './draw-toolbar.component.html',
  styleUrl: './draw-toolbar.component.css'
})
export class DrawToolbarComponent {
  private map!: maplibregl.Map;
  private draw!: MapboxDraw;

  constructor() { }

  ngOnInit(): void {
    // Initialize the map here or get it from a parent component/service
    this.map = new maplibregl.Map({
      container: 'map',
      style: 'https://api.maptiler.com/maps/b9ce2a02-280d-4a34-a002-37f946992dfa/style.json?key=NRZzdXmGDnNvgNaaF4Ic',
      center: [-74.3100039,40.697538], // starting position [lng, lat]
      zoom: 3 // starting zoom
    });

    this.draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        point: true,
        line_string: true,
        polygon: true
      }
    });

    const drawControl = new MapboxDrawControl(this.draw);
    this.map.addControl(drawControl);
  }

  drawPoint(): void {
    this.draw.changeMode('draw_point');
  }

  drawLineString(): void {
    this.draw.changeMode('draw_line_string');
  }

  drawPolygon(): void {
    this.draw.changeMode('draw_polygon');
  }
}
