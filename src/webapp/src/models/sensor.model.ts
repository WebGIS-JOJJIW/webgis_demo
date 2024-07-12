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