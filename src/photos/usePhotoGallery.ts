import { useCamera } from '@ionic/react-hooks/camera';
import { CameraPhoto, CameraResultType, CameraSource, FilesystemDirectory } from '@capacitor/core';
import { useEffect, useState } from 'react';
import { base64FromPath, useFilesystem } from '@ionic/react-hooks/filesystem';
import { useStorage } from '@ionic/react-hooks/storage';

export interface Photo {
    filepath: string;
    webviewPath?: string;
}

const PHOTO_STORAGE = 'photos';

export function usePhotoGallery() {
    const { getPhoto } = useCamera();
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [currentPhotoWebPath, setCurrentPhotoWebPath] = useState<string | undefined>(undefined);
    const [currentPhotoName, setCurrentPhotoName] = useState<string>('');

    const takePhoto = async () => {
        const cameraPhoto = await getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 100
        });
    
        const fileName = new Date().getTime() + '.jpeg';
        setCurrentPhotoName(fileName);
        const savedFileImage = await savePicture(cameraPhoto, fileName);
        setCurrentPhotoWebPath(await getPhotoByName(fileName));
        const newPhotos = [savedFileImage, ...photos]
        setPhotos(newPhotos);
        set(PHOTO_STORAGE, JSON.stringify(newPhotos));
    };

    const getPhotoByName = async(photoName: string | Promise<string>): Promise<string> => {
        let file : any = null;
        if( typeof photoName == 'string' && photoName !== ''){
            file = await readFile({
                path: photoName,
                directory: FilesystemDirectory.Data
            });
        }
        if(file)
            return `data:image/jpeg;base64,${file.data}`;
        else
            return '';
    }

    const {deleteFile, readFile, writeFile} = useFilesystem();
    const savePicture = async(photo: CameraPhoto, fileName: string): Promise<Photo> => {
        const base64Data = await base64FromPath(photo.webPath!);
        const savedFile = await writeFile({
            path: fileName,
            data: base64Data,
            directory: FilesystemDirectory.Data
        });

        return{
            filepath: fileName,
            webviewPath: photo.webPath
        };
    };

    const { get, set } = useStorage();
    useEffect(() => {
        const loadSaved = async () => {
            const photosString = await get(PHOTO_STORAGE);
            const photos = (photosString ? JSON.parse(photosString) : []) as Photo[];
            for (let photo of photos){
                const file = await readFile({
                    path: photo.filepath,
                    directory: FilesystemDirectory.Data
                });
                photo.webviewPath = `data:image/jpeg;base64,${file.data}`;
            }
            setPhotos(photos);
        };
        loadSaved();
    }, [get, readFile]);

    const deletePhoto = async(photo: Photo) => {
        const newPhotos = photos.filter(p => p.filepath !== photo.filepath);
        set(PHOTO_STORAGE, JSON.stringify(newPhotos));
        const filename = photo.filepath.substr(photo.filepath.lastIndexOf('/') + 1);
        await deleteFile({
            path: filename,
            directory: FilesystemDirectory.Data
        });
        setPhotos(newPhotos);
    };

    return {
        photos,
        takePhoto,
        deletePhoto,
        currentPhotoWebPath,
        getPhotoByName,
        setCurrentPhotoWebPath,
        currentPhotoName,
        setCurrentPhotoName
  };
}
