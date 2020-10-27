import {useState} from 'react'
import {getLogger} from "../core";

const log = getLogger('useItems')

export interface CarProps{
    id?: string,
    model: string,
    year: string
}

export interface CarsProps{
    cars: CarProps[],
    addCar: () => void
}

export const useCars: () => CarsProps = () => {
    const[cars, setCars] = useState([
        {id: '1', model: 'Dacia Logan', year: '2020'},
        {id: '2', model: 'Volkswagen Passat', year: '2018'}
    ]);
    const addCar = () => {
        const id = `${cars.length + 1}`;
        log('addCar');
        setCars(cars.concat({id, model:`New car model ${id}`, year: '2020'}));
    };
    log('returns');
    return{
        cars,
        addCar,
    };
};