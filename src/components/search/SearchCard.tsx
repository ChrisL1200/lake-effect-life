import React, { useState } from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
} from "@material-tailwind/react";
import ItemColor from '../../models/itemColor.model';
import Item from '../../models/item.model';

interface Props {
    item: Item;
}

interface State {
    selectedColor: ItemColor;
}

const SearchCard: React.FC<Props> = (props: Props) => {
    const { item } = props;
    const [state, setState] = useState<State>({
        selectedColor: item.colors[0]
    });

    const getPrice = () => {
        return Object.values(state.selectedColor.sizeToPriceMap)[0];
    }

    const selectColor = (selectedColor: ItemColor) => {
        setState({
            ...state,
            selectedColor
        });
    }

    return (
        <Card className="mt-6 w-96">
            <CardHeader color="blue-gray" className="relative h-56">
                <img
                    src={`/images/items/${state.selectedColor.imgUrls[0]}`}
                    alt="card-image"
                />
            </CardHeader>
            <CardBody>
                <div className="flex space-x-4 mb-4">
                    {item.colors.map((color) => (
                        <div
                            key={color.color}
                            onClick={() => selectColor(color)}
                            className={`h-6 w-6 rounded-full cursor-pointer border-1 ${state.selectedColor.color === color.color ? 'border-black' : 'border-transparent'
                                }`}
                            style={{ backgroundColor: color.color.toLowerCase() }}
                        >
                            {/* Add a check mark if the color is selected */}
                            {state.selectedColor === color && (
                                <div className="flex items-center justify-center h-full">
                                    <span className="text-white text-xl">&#10003;</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <Typography variant="h5" color="blue-gray" className="mb-2">
                    {item.name}
                </Typography>
                <Typography>
                    {state.selectedColor.color}
                </Typography>
                <p>${getPrice()}</p>
            </CardBody>
        </Card>
    );
};

export default SearchCard;
