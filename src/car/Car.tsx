import React from 'react'
import { CarProps } from "./CarProps";
import {IonItem, IonLabel} from "@ionic/react";

interface CarPropsExt extends CarProps{
    onEdit: (_id?: string) => void;
}

const Car : React.FC<CarPropsExt> = ({ _id, model, year, onEdit }) => {
    return(
        <IonItem onClick={() => onEdit(_id)}>
            <IonLabel>{model}</IonLabel>
        </IonItem>
    );
};

export default Car;