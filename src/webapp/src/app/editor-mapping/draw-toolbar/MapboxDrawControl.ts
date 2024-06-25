import { IControl, Map as MapboxMap } from 'maplibre-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';

class MapboxDrawControl implements IControl {
  private draw: MapboxDraw;

  constructor(draw: MapboxDraw) {
    this.draw = draw;
  }

  onAdd(map: MapboxMap): HTMLElement {
    this.draw.onAdd(map as any); // Type assertion to bypass type mismatch
    return (this.draw as any).options.container;
  }

  onRemove(map: MapboxMap): void {
    this.draw.onRemove(map as any); // Type assertion to bypass type mismatch
  }
}

export default MapboxDrawControl;
