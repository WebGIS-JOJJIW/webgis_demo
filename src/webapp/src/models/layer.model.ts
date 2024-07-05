export interface Layer {
    name: string;
    href: string;
    abs: string;
    type: string;
    vector_type: string;
  }
  
  export interface Layers {
    layer: Layer[];
  }
  
  export interface LayerResponse {
    layers: Layers;
  }