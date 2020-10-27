import React from 'react'

interface CarProps{
    id?: string,
    model: string,
    year: string
}

const Car : React.FC<CarProps> = ({ id, model, year }) => {
    return(
        <div>{model}</div>
    );
};

export default Car;