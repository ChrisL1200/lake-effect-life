import React, { useState } from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
} from "@material-tailwind/react";
import ItemColor from '../../models/itemColor.model';
import Item from '../../models/item.model';
import ColorSelector from '../common/ColorSelector';

interface Props {
    item: Item;
};

const SearchCard: React.FC<Props> = (props: Props) => {
    const { item } = props;

    const [selectedColor, setSelectedColor] = useState<ItemColor>(item.colors[0]);

    const getPrice = () => {
        return Object.values(selectedColor.sizeToPriceMap)[0];
    }

    return (
        <Card className="mt-6 w-96">
            <CardHeader color="blue-gray" className="relative h-56">
                <img
                    src={`/images/items/${selectedColor.imgUrls[0]}`}
                    alt="card-image"
                />
            </CardHeader>
            <CardBody>
                <ColorSelector colors={item.colors} selectedColor={selectedColor} setSelectedColor={setSelectedColor}></ColorSelector>
                <Typography variant="h5" color="blue-gray" className="mb-2">
                    {item.name}
                </Typography>
                <p>${getPrice()}</p>
            </CardBody>
        </Card>
    );
};

export default SearchCard;
