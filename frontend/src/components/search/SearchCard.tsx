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

    const [renderCarousel, setRenderCarousel] = useState<boolean>(true);
    const [selectedItemColor, setSelectedItemColor] = useState<ItemColor>(groupedItem.colors[0]);

    const getPrice = () => {
        return selectedItemColor.items[0].price;
    }

    const setSelectedColor = (selectedColor: ItemColor) => {
        setSelectedItemColor(selectedColor);
        setRenderCarousel(false);
        setTimeout(() => {
            setRenderCarousel(true);
        }, 0)
    }

    const handleClick = () => {
        navigate(`/item/${selectedItemColor.id}`);
    };

    return (
        <Card className="mt-6 max-w-52">
            <CardHeader className="relative">
                {renderCarousel &&
                    <Carousel>
                        {selectedItemColor.imgUrls.map((image, index) => (
                            <img
                                src={`/images/groupedItems/${image}`}
                                key={index}
                                className="h-48 w-auto object-cover"
                                loading="lazy"
                            />
                        ))}
                    </Carousel>
                }
            </CardHeader>
            <CardBody className="p-4">
                <ColorSelector colors={groupedItem.colors} selectedColor={selectedItemColor} setSelectedColor={setSelectedColor}></ColorSelector>
                <Typography variant="h6" color="blue-gray" className="truncate mb-2">
                    <a onClick={handleClick}>{groupedItem.id}</a>
                </Typography>
                <p>${getPrice()}</p>
            </CardBody>
        </Card>
    );
};

export default SearchCard;
