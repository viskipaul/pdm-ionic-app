import React, { useState } from "react";
import { withScriptjs, withGoogleMap, GoogleMap, Marker } from 'react-google-maps';
import { compose, withProps } from 'recompose';
import { mapsApiKey } from './mapsApiKey';

interface MyMapProps {
  lat?: number;
  lng?: number;
  onMapClick: (e: any) => any,
  onMarkerClick: (e: any) => void,
}

export const MyMap =
  compose<MyMapProps, any>(
    withProps({
      googleMapURL:
        `https://maps.googleapis.com/maps/api/js?key=${mapsApiKey}&v=3.exp&libraries=geometry,drawing,places`,
      loadingElement: <div style={{ height: `100%` }} />,
      containerElement: <div style={{ height: `400px` }} />,
      mapElement: <div style={{ height: `100%` }} />
    }),
    withScriptjs,
    withGoogleMap
  )(props => {
      const [latitude, setLatitude] = useState(props.lat);
      const [longitude, setLongitude] = useState(props.lng);
  
    return(
    <GoogleMap
      defaultZoom={8}
      defaultCenter={{ lat: props.lat, lng: props.lng }}
      onClick={(e: any) => {
        const l = props.onMapClick(e);
        setLatitude(l.latLng.lat());
        setLongitude(l.latLng.lng());
      }}
    >
      <Marker
        position={{ lat: latitude, lng: longitude }}
        onClick={props.onMarkerClick}
      />
    </GoogleMap>
)})
