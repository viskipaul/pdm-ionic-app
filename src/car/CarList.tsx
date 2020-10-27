import {IonContent, IonFab, IonFabButton, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar} from "@ionic/react";
import React, {useState} from 'react'
import Car from './Car'
import {add} from 'ionicons/icons'
import {getLogger} from "../core";
import {useCars} from "./useCars";

const log = getLogger('CarList')

const CarList: React.FC = () => {
    const {cars, addCar} = useCars();
    log('CarList render')

    return(
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Cars</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                {cars.map(({id, model, year}) => <Car key={id} model={model} year={year} />)}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={addCar}>
                        <IonIcon icon={add}/>
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};

export default CarList;