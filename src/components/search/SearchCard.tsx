import React, { useState } from 'react';
import { Color, Item } from "../../store/item.store.ts";
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Typography,
    Button,
} from "@material-tailwind/react";

interface Props {
    item: Item;
}

interface State {
    selectedColor: Color;
}

const SearchCard: React.FC<Props> = (props: Props) => {
    const { item } = props;
    const [state, setState] = useState<State>({
        selectedColor: item.colors[0]
    });

    const selectColor = (selectedColor: Color) => {
        setState({
            ...state,
            selectedColor
        });
    }

    return (
        <Card key={item.id} className="mt-6 w-96">
            <CardHeader color="blue-gray" className="relative h-56">
                <img
                    src={`/images/items/${item.imgUrls[0]}`}
                    alt="card-image"
                />
            </CardHeader>
            <CardBody>
                <div className="flex space-x-4 mb-4">
                    {item.colors.map((color) => (
                        <div
                            key={color}
                            onClick={() => selectColor(color)}
                            className={`h-6 w-6 rounded-full cursor-pointer border-1 ${state.selectedColor === color ? 'border-black' : 'border-transparent'
                                }`}
                            style={{ backgroundColor: color.toLowerCase() }}
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
                    {item.color}
                </Typography>
                <p>${item.price}</p>
            </CardBody>
            <CardFooter className="pt-0">
                <Button>{item.id}</Button>
            </CardFooter>
        </Card>
    );
};

export default SearchCard;
