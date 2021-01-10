import React, { useContext, useEffect, useState } from 'react';
import {
    IonButton,
    IonButtons,
    IonCol,
    IonContent,
    IonFab,
    IonFabButton,
    IonGrid,
    IonHeader,
    IonIcon,
    IonImg,
    IonInput, IonItem, IonLabel,
    IonLoading,
    IonPage,
    IonRow,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import { getLogger } from '../core';
import { CarContext } from './CarProvider';
import { RouteComponentProps } from 'react-router';
import { CarProps } from './CarProps';
import { useMyLocation } from '../maps/useMyLocation'
import { MyMap } from '../maps/MyMap'
import { usePhotoGallery } from '../photos/usePhotoGallery';
import { camera } from 'ionicons/icons';

const log = getLogger('ItemEdit');

interface CarEditProps extends RouteComponentProps<{
    id?: string;
}> {}

const CarEdit: React.FC<CarEditProps> = ({ history, match }) => {
    const { cars, saving, savingError, saveCar } = useContext(CarContext);
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [car, setCar] = useState<CarProps>();
    const myLocation = useMyLocation();
    const [latitude, setLatitude] = useState<number | undefined>(myLocation.position?.coords.latitude);
    const [longitude, setLongitude] = useState<number | undefined>(myLocation.position?.coords.longitude);
    const{takePhoto, currentPhotoName, currentPhotoWebPath, setCurrentPhotoWebPath, getPhotoByName, setCurrentPhotoName} = usePhotoGallery();

    useEffect(() => {
        log('useEffect');
        const routeId = match.params.id || '';
        const car = cars?.find(it => it._id?.toString() === routeId);
        setCar(car);
        if (car) {
            setModel(car.model);
            setYear(car.year);
            if(typeof car.image === 'string'){
                setCurrentPhotoName(car.image);
            }
            if(car.latitude)
                setLatitude(car.latitude);
            else 
                setLatitude(46.185795);
            if(car.longitude)
                setLongitude(car.longitude);
            else
                setLongitude(21.326236);
        }

        const setWebPath = async () => {
            if(car && car.image){
                setCurrentPhotoWebPath(await getPhotoByName(car.image));
            }
        }

        setWebPath();

    }, [match.params.id, cars]);
    const handleSave = () => {
        let newId: string = '-1';
        const editedItem = car ? { ...car, model, year, latitude, longitude, image:currentPhotoName } : {id:newId, model:model, year:year, latitude:latitude, longitude:longitude, image:currentPhotoName };
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
                    <IonInput value={year} onIonChange={e => setYear(e.detail.value || '')}/>
                </IonItem>
                <IonLoading isOpen={saving} />
                <IonGrid>
                    <IonRow>
                        <IonCol>
                            <MyMap lat={latitude} lng={longitude} onMapClick={log('onMap')} onMarkerClick={log('onMarker')}/>
                        </IonCol>
                        <IonCol>
                            <IonImg className="carimage" src={currentPhotoWebPath}>Poza</IonImg>
                        </IonCol>
                    </IonRow>
                </IonGrid>

                {savingError && (
                    <div>{savingError.message || 'Failed to save item'}</div>
                )}
                <div>Selected latitude: {latitude}</div>
                <div>Selected longitude: {longitude}</div>
                
                <IonFab vertical="bottom" horizontal="center" slot="fixed">
                    <IonFabButton onClick={() => takePhoto()}>
                        <IonIcon icon={camera}/>
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
    function log(source: string){
        return(l: any) => {
            console.log(source, l.latLng.lat(), l.latLng.lng());
            setLatitude(l.latLng.lat());
            setLongitude(l.latLng.lng());
            return l};
    }
};

export default CarEdit;
