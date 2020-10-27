import React from 'react'
import { CarProps } from "./CarProps";
import {IonItem, IonLabel} from "@ionic/react";

interface CarPropsExt extends CarProps{
    onEdit: (id?: string) => void;
}

const Car : React.FC<CarPropsExt> = ({ id, model, year, onEdit }) => {
    return(
        <IonItem onClick={() => onEdit(id)}>
            <IonLabel>{model}</IonLabel>
        </IonItem>
    );
};

export default Car;