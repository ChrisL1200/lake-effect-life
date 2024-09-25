import React, { useState } from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Carousel
} from "@material-tailwind/react";
import ItemColor from '../../models/itemColor.model';
import ColorSelector from '../common/ColorSelector';
import { useNavigate } from 'react-router-dom';
import GroupedItem from '../../models/groupedItem.model';

interface Props {
    groupedItem: GroupedItem;
}

const SearchCard: React.FC<Props> = (props: Props) => {
    const { groupedItem } = props;
    const navigate = useNavigate();

    const [selectedItemColor, setSelectedItemColor] = useState<ItemColor>(groupedItem.colors[0]);

    const getPrice = () => {
        return selectedItemColor.items[0].price;
    }

    const handleClick = () => {
        navigate(`/item/${groupedItem.id}`);
    };

    return (
        <Card className="mt-6">
            <CardHeader onClick={handleClick} className="relative">
                <Carousel
                    className="rounded-xl"
                >
                    {selectedItemColor.imgUrls.map((image, index) => (
                        <img
                            src={`/images/groupedItems/${image}`}
                            key={index}
                            className="object-cover w-full"
                        />
                    ))}
                </Carousel>
            </CardHeader>
            <CardBody>
                <ColorSelector colors={groupedItem.colors} selectedColor={selectedItemColor} setSelectedColor={setSelectedItemColor}></ColorSelector>
                <Typography variant="h5" color="blue-gray" className="mb-2">
                    {groupedItem.id}
                </Typography>
                <p>${getPrice()}</p>
            </CardBody>
        </Card>
    );
};

export default SearchCard;
