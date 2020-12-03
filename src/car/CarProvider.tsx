import React, {useCallback, useContext, useEffect, useReducer} from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { CarProps } from './CarProps';
import {createCar, getCars, newWebSocket, updateCar} from './carApi';
import {AuthContext} from "../auth";
import { Plugins } from '@capacitor/core'

const log = getLogger('ItemProvider');

type SaveCarFn = (car: CarProps) => Promise<any>;

type GetNextFn = ($event: CustomEvent<void>, items?: CarProps[]) => Promise<any>;

export interface CarsState {
    cars?: CarProps[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    saveCar?: SaveCarFn,
    getNext?: GetNextFn,
    disableInfiniteScroll: boolean
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: CarsState = {
    disableInfiniteScroll: false,
    fetching: false,
    saving: false,
};

const FETCH_ITEMS_STARTED = 'FETCH_ITEMS_STARTED';
const FETCH_ITEMS_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
const FETCH_ITEMS_FAILED = 'FETCH_ITEMS_FAILED';
const SAVE_ITEM_STARTED = 'SAVE_ITEM_STARTED';
const SAVE_ITEM_SUCCEEDED = 'SAVE_ITEM_SUCCEEDED';
const SAVE_ITEM_FAILED = 'SAVE_ITEM_FAILED';
const MORE_ITEMS = 'MORE_ITEMS';

const reducer: (state: CarsState, action: ActionProps) => CarsState =
    (state, { type, payload }) => {
        switch(type) {
            case MORE_ITEMS:
                return { ...state, cars: payload.cars}
            case FETCH_ITEMS_STARTED:
                return { ...state, fetching: true, fetchingError: null };
            case FETCH_ITEMS_SUCCEEDED:
                return { ...state, cars: payload.cars, fetching: false };
            case FETCH_ITEMS_FAILED:
                return { ...state, fetchingError: payload.error, fetching: false };
            case SAVE_ITEM_STARTED:
                return { ...state, savingError: null, saving: true };
            case SAVE_ITEM_SUCCEEDED:
                const cars = [...(state.cars || [])];
                const car = payload.car;
                const index = cars.findIndex(it => it._id === car.id);
                if (index === -1) {
                    cars.splice(0, 0, car);
                } else {
                    cars[index] = car;
                }
                return { ...state,  cars, saving: false };
            case SAVE_ITEM_FAILED:
                return { ...state, savingError: payload.error, saving: false };
            default:
                return state;
        }
    };

export const CarContext = React.createContext<CarsState>(initialState);

interface CarProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const CarProvider: React.FC<CarProviderProps> = ({ children }) => {
    let limit = 15;
    const {token} = useContext(AuthContext)
    const [state, dispatch] = useReducer(reducer, initialState);
    const { cars, fetching, fetchingError, saving, savingError, disableInfiniteScroll } = state;
    useEffect(getCarsEffect, [token]);
    useEffect(wsEffect, [token])
    const saveCar = useCallback<SaveCarFn>(saveCarCallback, [token]);
    const getNext = useCallback<GetNextFn>(getMoreCars, [token]);
    const value = { cars, fetching, fetchingError, saving, savingError, saveCar, getNext, disableInfiniteScroll };
    log('returns');
    return (
        <CarContext.Provider value={value}>
            {children}
        </CarContext.Provider>
    );

    async function getMoreCars($event: CustomEvent<void>, cars?: CarProps[]){
        debugger;
        let new_cars = [];
        limit += 3;
        const {Storage} = Plugins;
        new_cars = await getCars(token, limit);
        await Storage.set({
            key: 'cars',
            value: JSON.stringify(new_cars),
        });
        dispatch({type: MORE_ITEMS, payload: {cars: new_cars}});
        ($event.target as HTMLIonInfiniteScrollElement).complete();
    }

    function getCarsEffect() {
        let canceled = false;
        fetchCars();
        return () => {
            canceled = true;
        }

        async function fetchCars() {
            if (!token?.trim()) {
                return;
            }
            try {
                log('fetchItems started');
                dispatch({ type: FETCH_ITEMS_STARTED });
                const cars = await getCars(token, limit);

                const { Storage } = Plugins;

                log('fetchItems succeeded');
                if (!canceled) {
                    dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { cars } });
                    await Storage.set({
                        key: 'cars',
                        value: JSON.stringify(cars)
                    });
                }
            } catch (error) {
                const { Storage } = Plugins;
                const carsS = await Storage.get({key: 'cars'});
                if(carsS.value){
                    console.log("Cars found in local storage.");
                    const parsedValue = JSON.parse(carsS.value);
                    dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {cars: parsedValue} });
                } else{
                    log('fetchItems failed');
                    dispatch({ type: FETCH_ITEMS_FAILED, payload: { error } });
                }
            }
        }
    }

    async function saveCarCallback(car: CarProps) {
        try {
            log('saveItem started');
            dispatch({ type: SAVE_ITEM_STARTED });
            const savedCar = await (car._id ? updateCar(token, car) : createCar(token, car));
            log('saveItem succeeded');
            dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { car: savedCar } });
        } catch (error) {
            log('saveItem failed');
            dispatch({ type: SAVE_ITEM_FAILED, payload: { error } });
        }
    }

    function wsEffect() {
        let canceled = false;
        log('wsEffect - connecting');
        let closeWebSocket: () => void;
        if (token?.trim()) {
            closeWebSocket = newWebSocket(token, message => {
                if (canceled) {
                    return;
                }
                const {type, payload: car} = message;
                log(`ws message, item ${type}`);
                if (type === 'created' || type === 'updated') {
                    dispatch({type: SAVE_ITEM_SUCCEEDED, payload: {car}});
                }
            });
        }
        return () => {
            log('wsEffect - disconnecting');
            canceled = true;
            closeWebSocket?.();
        }
    }
};
