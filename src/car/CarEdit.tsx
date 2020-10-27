import React, { useContext, useEffect, useState } from 'react';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput, IonItem, IonLabel,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import { getLogger } from '../core';
import { CarContext } from './CarProvider';
import { RouteComponentProps } from 'react-router';
import { CarProps } from './CarProps';

const log = getLogger('ItemEdit');

interface CarEditProps extends RouteComponentProps<{
    id?: string;
}> {}

const CarEdit: React.FC<CarEditProps> = ({ history, match }) => {
    const { cars, saving, savingError, saveCar } = useContext(CarContext);
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [car, setCar] = useState<CarProps>();
    useEffect(() => {
        log('useEffect');
        const routeId = match.params.id || '';
        const car = cars?.find(it => it.id === routeId);
        setCar(car);
        if (car) {
            setModel(car.model);
            setYear(car.year);
        }
    }, [match.params.id, cars]);
    const handleSave = () => {
        const editedItem = car ? { ...car, model, year } : { model, year };
        saveCar && saveCar(editedItem).then(() => history.goBack());
    };
    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Edit</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleSave}>
                            Save
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonItem>
                    <IonLabel position="floating">Model</IonLabel>
                    <IonInput value={model} onIonChange={e => setModel(e.detail.value || '')} />
                </IonItem>
                <IonItem>
                    <IonLabel position="floating">Year</IonLabel>
                    <IonInput value={year} onIonChange={e => setYear(e.detail.value || '')} />
                </IonItem>
                <IonLoading isOpen={saving} />
                {savingError && (
                    <div>{savingError.message || 'Failed to save item'}</div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default CarEdit;
