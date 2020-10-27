import axios from 'axios';
import{getLogger} from '../core';
import{CarProps} from "./CarProps";

const log = getLogger('carApi');

const baseUrl = 'http://192.168.0.163:3000';
const carUrl = `${baseUrl}/car`;

interface ResponseProps<T> {
    data: T;
}

function withLogs<T>(promise: Promise<ResponseProps<T>>, fnName: string): Promise<T>{
    log(`${fnName} - started`);
    return promise
        .then(res =>{
            log(`${fnName} - succeeded`);
            return Promise.resolve(res.data);
        })
        .catch(err => {
            log(`${fnName} - failed`);
            return Promise.reject(err);
        });
}

const config = {
    headers:{
        'Content-Type': 'application/json'
    }
};

export const getCars: () => Promise<CarProps[]> = () => {
    return withLogs(axios.get(carUrl, config), 'getCars');
}

export const createCar: (car: CarProps) => Promise<CarProps[]> = car => {
    return withLogs(axios.post(carUrl, car, config), 'createCar');
}

export const updateCar: (car: CarProps) => Promise<CarProps[]> = car =>{
    return withLogs(axios.put(`${carUrl}/${car.id}`, car, config), 'updateCar');
}