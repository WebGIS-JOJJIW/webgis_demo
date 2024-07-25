export interface SensorData {
      id: number;
      sensor_id: number;
      sensor_name: string;
      sensor_poi_id: string;
      lat: number | null;
      lon: number | null;
      sensor_type_id: number;
      sensor_type_name: string;
      region_id: number;
      region_name: string;
      data_type_id: number;
      data_type_name: string;
      value: string;
      dt: string;
      dt_year: string;
      dt_yearmon: string;
      dt_epoch: number;
      partition_yearmon: string;
    }

  export interface Event {
    dateTime: string;
    type: string;
    system: string;
    sensorName : string;
    description: string;
  }