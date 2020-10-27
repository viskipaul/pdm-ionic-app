import {
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon, IonList,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar
} from "@ionic/react";
import React, {useContext} from 'react'
import Car from './Car'
import {add} from 'ionicons/icons'
import {getLogger} from "../core";
import {RouteComponentProps} from "react-router";
import {CarContext} from "./CarProvider";

const log = getLogger('CarList')

const CarList: React.FC<RouteComponentProps> = ({history}) => {
    const {cars, fetching, fetchingError} = useContext(CarContext);
    log('CarList render')

    return(
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Cars</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message={"Fetching items..."}/>
                {cars && (
                    <IonList>
                        {cars.map(({id, model, year}) => <Car key={id} id={id} model={model} year={year}
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
            </IonContent>
        </IonPage>
    );
};

export default CarList;