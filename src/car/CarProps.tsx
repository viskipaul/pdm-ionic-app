export interface CarProps{
    _id? : string;
    model : string;
    year : string;
    latitude: number | undefined;
    longitude: number | undefined;
    image: string | Promise<string>;
}