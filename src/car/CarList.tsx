import {
    IonButton,
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonList,
    IonLoading,
    IonPage,
    IonSearchbar,
    IonTitle,
    IonToolbar
} from "@ionic/react";
import React, {useContext, useState} from 'react'
import Car from './Car'
import {add} from 'ionicons/icons'
import {getLogger} from "../core";
import {RouteComponentProps} from "react-router";
import {CarContext} from "./CarProvider";
import {AuthContext} from '../auth';

const log = getLogger('CarList')

const CarList: React.FC<RouteComponentProps> = ({history}) => {
    const {cars, fetching, fetchingError, getNext, disableInfiniteScroll} = useContext(CarContext);
    const {logout} = useContext(AuthContext);
    const [searchCar, setSearchCar] = useState<string>('');

    const handleLogout = () => {
        logout?.();
    }
    log('CarList render')

    return(
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Cars</IonTitle>
                    <IonButton className="homeButton" routerLink="/cars">Home</IonButton>
                    <IonButton className="photosButton" routerLink="/photos">Photo Gallery</IonButton>
                    <IonButton className="logoutbutton" onClick={handleLogout}>Logout</IonButton>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message={"Fetching items..."}/>
                <IonSearchbar value={searchCar} debounce={500} onIonChange={e => setSearchCar(e.detail.value!)}></IonSearchbar>
                {cars && (
                    <IonList>
                        {cars
                        .filter(({_id, model, year}) => model.indexOf(searchCar) >= 0)
                        .map(({_id, model, year, latitude, longitude, image}) => <Car key={_id} _id={_id} model={model} year={year} latitude={latitude} longitude={longitude} image={image}
                        onEdit={id => history.push(`/car/${id}`)} />)}
                    </IonList>
                )}
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch items'}</div>
                )}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/car')}>
                        <IonIcon icon={add}/>
                    </IonFabButton>
                </IonFab>
                <IonInfiniteScroll threshold="5px" disabled={disableInfiniteScroll} onIonInfinite={(e: CustomEvent<void>) => getNext?.(e, cars)}>
                    <IonInfiniteScrollContent loadingText="Loading more cars..."></IonInfiniteScrollContent>
                </IonInfiniteScroll>
            </IonContent>
        </IonPage>
    );
};

export default CarList;