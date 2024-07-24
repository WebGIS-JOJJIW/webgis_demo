export interface Layer {
    name: string;
    href: string;
    abs: string;
    type: string;
    vector_type: string;
    checked: boolean ;
  }
  
  export interface Layers {
    layer: Layer[];
  }
  
  export interface LayerResponse {
    layers: Layers;
  }


  export class Layer_List {
    name: string ='' ;
    originalName : string ='';
    zone: string ='';
    type: string ='';
    typeID: string ='';
    subtype: string ='';
  }

  export class LayerDisplay{
    name:string = '';
    type = 'RASTER' || 'VECTOR';
  }