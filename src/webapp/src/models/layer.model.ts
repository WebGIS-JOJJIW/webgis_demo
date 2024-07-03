export interface Layer {
    name: string;
    href: string;
    abs: string;
  }
  
  export interface Layers {
    layer: Layer[];
  }
  
  export interface LayerResponse {
    layers: Layers;
  }