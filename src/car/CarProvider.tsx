import React, { useCallback, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { CarProps } from './CarProps';
import { createCar, getCars, updateCar } from './carApi';

const log = getLogger('ItemProvider');

type SaveCarFn = (car: CarProps) => Promise<any>;

export interface CarsState {
    cars?: CarProps[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    saveCar?: SaveCarFn,
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: CarsState = {
    fetching: false,
    saving: false,
};

const FETCH_ITEMS_STARTED = 'FETCH_ITEMS_STARTED';
const FETCH_ITEMS_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
const FETCH_ITEMS_FAILED = 'FETCH_ITEMS_FAILED';
const SAVE_ITEM_STARTED = 'SAVE_ITEM_STARTED';
const SAVE_ITEM_SUCCEEDED = 'SAVE_ITEM_SUCCEEDED';
const SAVE_ITEM_FAILED = 'SAVE_ITEM_FAILED';

const reducer: (state: CarsState, action: ActionProps) => CarsState =
    (state, { type, payload }) => {
        switch(type) {
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
                const index = cars.findIndex(it => it.id === car.id);
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
    const [state, dispatch] = useReducer(reducer, initialState);
    const { cars, fetching, fetchingError, saving, savingError } = state;
    useEffect(getCarsEffect, []);
    const saveCar = useCallback<SaveCarFn>(saveCarCallback, []);
    const value = { cars, fetching, fetchingError, saving, savingError, saveCar };
    log('returns');
    return (
        <CarContext.Provider value={value}>
            {children}
        </CarContext.Provider>
    );

    function getCarsEffect() {
        let canceled = false;
        fetchCars();
        return () => {
            canceled = true;
        }

        async function fetchCars() {
            try {
                log('fetchItems started');
                dispatch({ type: FETCH_ITEMS_STARTED });
                const cars = await getCars();
                log('fetchItems succeeded');
                if (!canceled) {
                    dispatch({ type: FETCH_ITEMS_SUCCEEDED, payload: { cars } });
                }
            } catch (error) {
                log('fetchItems failed');
                dispatch({ type: FETCH_ITEMS_FAILED, payload: { error } });
            }
        }
    }

    async function saveCarCallback(car: CarProps) {
        try {
            log('saveItem started');
            dispatch({ type: SAVE_ITEM_STARTED });
            const savedCar = await (car.id ? updateCar(car) : createCar(car));
            log('saveItem succeeded');
            dispatch({ type: SAVE_ITEM_SUCCEEDED, payload: { car: savedCar } });
        } catch (error) {
            log('saveItem failed');
            dispatch({ type: SAVE_ITEM_FAILED, payload: { error } });
        }
    }
};
