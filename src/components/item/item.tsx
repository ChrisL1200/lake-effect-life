// src/pages/ViewItemPage.tsx
import React from 'react';
import { useParams } from 'react-router-dom';

const Item: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    return <h1>Woot Item Page - Item ID: {id}</h1>;
};

export default Item;
