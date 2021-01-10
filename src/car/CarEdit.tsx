import React, { useContext, useEffect, useState } from 'react';
import {
    createAnimation,
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
    useEffect(groupAnimation, []);
    useEffect(chainAnimation, []);
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
        if(model === '')
            console.log('Model empty');
            shakeModelInput();
        if(year === '')
            shakeYearInput();
        if(model !== '' && year !== '')
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
                    <IonInput className="modelInput" value={model} onIonChange={e => setModel(e.detail.value || '')} />
                </IonItem>
                <IonItem>
                    <IonLabel position="floating">Year</IonLabel>
                    <IonInput className="yearInput" value={year} onIonChange={e => setYear(e.detail.value || '')}/>
                </IonItem>
                <IonLoading isOpen={saving} />
                <IonGrid>
                    <IonRow>
                        <IonCol>
                        {
                            !model && <div className="modelError"><p>Please enter model!</p></div>
                        }
                        {
                            !year && <div className="yearError"><p>Please enter year!</p></div>
                        }
                        </IonCol>
                    </IonRow>
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
                <div className="container">
                    <div className="groupAnimation">
                        <p className="group1">Selected latitude: {latitude}</p>
                        <p className="group2">Selected longitude: {longitude}</p>
                    </div>
                </div>
                
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

    function shakeModelInput(){
        const el = document.querySelector('.modelError');
        if(el){
            const animation = createAnimation()
            .addElement(el)
            .duration(100)
            .direction('normal')
            .iterations(1)
            .keyframes([
                {offset: 0, transform:'translateX(0)'},
                {offset: 0.125, transform:'translateX(-15px)'},
                {offset: 0.375, transform:'translateX(12px)'},
                {offset: 0.625, transform:'translate(-8px)'},
                {offset: 0.875, transform:'translate(7px)'},
                {offset: 1, transform:'translate(0)'}
            ]);
        animation.play();
        }
    }

    function shakeYearInput(){
        const el = document.querySelector('.yearError');
        if(el){
            const animation = createAnimation()
            .addElement(el)
            .duration(100)
            .direction('normal')
            .iterations(1)
            .keyframes([
                {offset: 0, transform:'translateX(0)'},
                {offset: 0.125, transform:'translateX(-15px)'},
                {offset: 0.375, transform:'translateX(12px)'},
                {offset: 0.625, transform:'translate(-8px)'},
                {offset: 0.875, transform:'translate(7px)'},
                {offset: 1, transform:'translate(0)'}
            ]);
        animation.play();
        }
    }

    function groupAnimation(){
        const el1 = document.querySelector('.group1');
        const el2 = document.querySelector('.group2');
        if(el1 && el2){
            const anim1 = createAnimation().addElement(el1).direction('alternate').iterations(Infinity).fromTo('transform', 'scale(1)', 'scale(1.5)');
            const anim2 = createAnimation().addElement(el2).direction('alternate').iterations(Infinity).fromTo('transform', 'scale(1)', 'scale(0.5)');
            const parentAnimation = createAnimation().duration(500).addAnimation([anim1, anim2]);
            parentAnimation.play();
        }
    }

    function chainAnimation(){
        const el1 = document.querySelector('.modelInput');
        const el2 = document.querySelector('.yearInput');
        if(el1 && el2){
            const anim1 = createAnimation().addElement(el1).duration(500).keyframes([
                {offset: 0, transform: 'translateX(0)'},
                {offset: 0.5, transform: 'translateX(15px)'},
                {offset: 1, transform: 'translateX(0)'}
            ]);
            const anim2 = createAnimation().addElement(el2).duration(500).keyframes([
                {offset: 0, transform: 'translateX(0)'},
                {offset: 0.5, transform: 'translateX(15px)'},
                {offset: 1, transform: 'translateX(0)'}
            ]);
            (async () => {
                await anim1.play();
                await anim2.play();
            })();
        }
    }

};

export default CarEdit;
