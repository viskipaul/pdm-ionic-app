import {IonActionSheet, IonButton, IonCol, IonContent, IonFab, IonFabButton, IonGrid, IonHeader, IonIcon, IonImg, IonPage, IonRow, IonTitle, IonToolbar} from '@ionic/react';
import React, { useState } from 'react';
import { camera, close, trash } from 'ionicons/icons';
import { Photo, usePhotoGallery } from './usePhotoGallery';

const PhotosHome: React.FC = () => {
    const { photos, takePhoto, deletePhoto } = usePhotoGallery();
    const [photoToDelete, setPhotoToDelete] = useState<Photo>();
    return(
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Photo Gallery</IonTitle>
                    <IonButton className="homeButton" routerLink="/">Home</IonButton>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonHeader collapse="condense">
                    <IonToolbar>
                        <IonTitle size="large">Blank</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonGrid>
                    <IonRow>
                        {photos.map((photo, index) => (
                            <IonCol size="6" key={index}>
                                <IonImg onClick={() => setPhotoToDelete(photo)} src={photo.webviewPath}/>
                            </IonCol>
                        ))}
                    </IonRow>
                </IonGrid>
                <IonFab vertical="bottom" horizontal="center" slot="fixed">
                    <IonFabButton onClick={() => takePhoto()}>
                        <IonIcon icon={camera}></IonIcon>
                    </IonFabButton>
                </IonFab>
                <IonActionSheet isOpen={!!photoToDelete}
                buttons={[{
                    text: 'Delete',
                    role: 'destructive',
                    icon: trash,
                    handler: () => {
                        if(photoToDelete){
                            deletePhoto(photoToDelete);
                            setPhotoToDelete(undefined);
                        }
                    }
                }, {
                    text: 'Cancel',
                    icon: close,
                    role: 'cancel'
                }]}
                onDidDismiss = { () => setPhotoToDelete(undefined)}
                />
            </IonContent>
        </IonPage>
    )
};

export default PhotosHome;