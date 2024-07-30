export interface Photo {
    url: string;
    time: string;
    by: string;
}

export interface Sensor {
    coordinates: [number, number];
    title: string;
    humanCount: number;
    vehicleCount: number;
    otherCount: number;
    healthStatus: string;
    healthTime: string;
    latestPhotoTime: string;
    latestPhoto: string;
    previousPhotos: Photo[];
}

export class DroneModel{
  title:string ='';
  imgPath :string = '';
  coordinates: [number, number] = [0,0];
}


export interface MarkerDetailsData {
    title: string;
    humanCount: number;
    vehicleCount: number;
    otherCount: number;
    healthStatus: string;
    healthTime: string;
    latestPhotoTime: string;
    latestPhoto: string;
    previousPhotos: { url: string; time: string; by: string; }[];
    coordinates: [number, number],
}

export interface Geometry {
    type: string;
    coordinates: number[];
  }
  
  export interface Properties {
    name: string | null;
    vector_type: string | null;
    image_relpath: string | null;
  }
  
  export interface Feature {
    type: string;
    id: string;
    geometry: Geometry;
    geometry_name: string;
    properties: Properties;
  }
  
  export interface FeatureCollection {
    type: string;
    features: Feature[];
    totalFeatures: number;
    numberMatched: number;
    numberReturned: number;
    timeStamp: string;
    crs: CRS;
  }
  
  export interface CRSProperties {
    name: string;
  }
  
  export interface CRS {
    type: string;
    properties: CRSProperties;
  }
  
  