import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Radio, Carousel } from '@material-tailwind/react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Item from '../../models/item.model';
import ColorSelector from '../common/ColorSelector';
import ItemColor, { ItemSize } from '../../models/itemColor.model';

const View: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    const item: Item = useSelector((reduxState: RootState) => {
        return reduxState.items.itemMap[id] ?? {};
    });

    const [selectedColor, setSelectedColor] = useState<ItemColor>();
    const [selectedSize, setSelectedSize] = useState<ItemSize>();
    const [isItemLoaded, setIsItemLoaded] = useState(false);

    useEffect(() => {
        if (item?.colors) {
            const selectedColor = item.colors[0] 
            setIsItemLoaded(true);
            setSelectedColor(selectedColor);
            setSelectedSize(Object.keys(selectedColor.sizeToPriceMap)[0]);
        }
    }, [item]);

    const handleAddToCart = () => {
        if (!selectedColor || !selectedSize) {
            alert('Please select both a color and size');
            return;
        }
        // Handle add to cart logic here
        console.log(`Added to cart: Item ID: ${item!.id}, Color: ${selectedColor}, Size: ${selectedSize}`);
    };

    if (!isItemLoaded) {
        return <div>Loading...</div>; // Show a loading state before the item is loaded
    }

    return (
        <div className="mx-auto max-w-3xl p-6">
            <h1 className="text-3xl font-bold mb-4">{item.name}</h1>
            <p className="text-xl text-gray-700 mb-6">${selectedColor.sizeToPriceMap[selectedSize]}</p>

            {/* Image Carousel from Material Tailwind */}
            <div className="relative w-full h-64 mb-6">
                <Carousel loop>
                    {selectedColor.imgUrls.map((image, index) => (
                        <img
                            key={index}
                            src={`/images/items/${selectedColor.imgUrls[0]}`}
                            alt={`Image ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                        />
                    ))}
                </Carousel>
            </div>

            <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Select Color:</h2>

                <ColorSelector colors={item.colors} selectedColor={selectedColor} setSelectedColor={setSelectedColor}></ColorSelector>
            </div>

            <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Select Size:</h2>
                <div className="flex space-x-4">
                    {Object.keys(selectedColor.sizeToPriceMap).map((size) => (
                        <Radio
                            key={size}
                            id={size}
                            name="size"
                            label={size}
                            onChange={() => setSelectedSize(size)}
                            className={selectedSize === size ? 'text-blue-500' : ''}
                        />
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
