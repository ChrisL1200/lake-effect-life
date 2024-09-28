﻿import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Breadcrumbs, Button, Carousel } from '@material-tailwind/react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import ColorSelector from '../common/ColorSelector';
import GroupedItem from '../../models/groupedItem.model';
import ItemColor from '../../models/itemColor.model';
import Item from '../../models/item.model';
import { upsertItemFromCart } from '../../store/cart.store';
import CartItem from '../../models/cartItem.model';

const View: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const dispatch = useDispatch();

    const selectedColor: ItemColor = useSelector((reduxState: RootState) => {
        return reduxState.items.itemColorMap[id!] ?? {};
    });

    const groupedItem: GroupedItem = useSelector((reduxState: RootState) => {
        return selectedColor.groupedItemId ? reduxState.items.groupedItemMap[selectedColor.groupedItemId] : {} as GroupedItem;
    });

    const [selectedItem, setSelectedItem] = useState<Item>();
    const [isItemLoaded, setIsItemLoaded] = useState(false);

    useEffect(() => {
        if (selectedColor?.groupedItemId) {
            setIsItemLoaded(true);
            setSelectedItem(selectedColor.items[0]);
        }
    }, [selectedColor]);

    const handleAddToCart = () => {
        if (!selectedColor || !selectedItem) {
            alert('Please select both a color and size');
            return;
        }

        const cartItem: CartItem = {
            itemId: selectedItem.id,
            itemColorId: selectedColor.id,
            groupedItemId: groupedItem.id,
            quantity: 1
        };
        dispatch(upsertItemFromCart(cartItem));
    };

    const setColor = (itemColor: ItemColor) => {
        const size = selectedItem!.size;
        setSelectedItem(itemColor.items.find((item: Item) => item.size === size));
    };

    if (!isItemLoaded) {
        return <div>Loading...</div>; 
    }

    return (
        <div className="mx-auto max-w-3xl px-6 py-2">
            <Breadcrumbs fullWidth className="bg-transparent pl-0">
                <a href="/search" className="opacity-60">
                    Search
                </a>
                <a>{groupedItem.id}</a>
            </Breadcrumbs>
            <h1 className="text-3xl font-bold mb-2">{groupedItem.id}</h1>
            <p className="text-xl text-gray-700 mb-2">${selectedItem?.price}</p>

            <div className="relative w-full mb-2">
                <Carousel loop>
                    {selectedColor?.imgUrls.map((image: string, index: number) => (
                        <img
                            key={index}
                            src={`/images/groupedItems/${image}`}
                            alt={`Image ${index + 1}`}
                            className="object-cover w-full max-h-96"
                        />
                    ))}
                </Carousel>
            </div>

            <div className="mb-2">
                <h2 className="text-lg font-semibold mb-2">Select Color:</h2>

                <ColorSelector colors={groupedItem.colors} selectedColor={selectedColor!} setSelectedColor={setColor}></ColorSelector>
            </div>

            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-2">Select Size:</h2>
                <div className="flex space-x-4">
                    {selectedColor?.items.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => setSelectedItem(item)}
                            className={`cursor-pointer border px-4 py-2 rounded-md transition-all duration-200 
                                ${item.id === selectedItem?.id
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-black hover:bg-blue-100'
                                }`}
                        >
                            {item?.size}
                        </div>
                    ))}
                </div>
            </div>

            <Button onClick={handleAddToCart} className="w-full bg-blue-500">
                Add to Cart
            </Button>
        </div>
    );
};

export default View;
