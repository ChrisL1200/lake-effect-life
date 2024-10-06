import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Breadcrumbs, Button, Carousel } from '@material-tailwind/react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import { useNavigate, Link } from 'react-router-dom';
import { RootState } from '../../store';
import ColorSelector from '../common/ColorSelector';
import GroupedItem from '../../models/groupedItem.model';
import ItemColor from '../../models/itemColor.model';
import Item, { ItemSize } from '../../models/item.model';
import { upsertItemFromCart } from '../../store/cart.store';
import CartItem from '../../models/cartItem.model';


const View: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const sizeList: ItemSize[] = [
        ItemSize.SMALL,
        ItemSize.MEDIUM,
        ItemSize.LARGE,
        ItemSize.XLARGE,
        ItemSize.XXLARGE
    ]

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
        navigate(`/item/${itemColor.id}`, { replace: true });
        setSelectedItem(itemColor.items.find((item: Item) => item.size === size));
    };

    const setSize = (size: ItemSize) => {
        if (availableSizes.includes(size)) {
            setSelectedItem(selectedColor.items.find((item: Item) => item.size === size));
        }
    }

    if (!isItemLoaded) {
        return <div>Loading...</div>; 
    }

    const availableSizes = selectedColor.items.map((item) => item.size);

    return (
        <div className="px-6 py-2 mx-auto max-w-3xl">
            <Breadcrumbs fullWidth className="bg-transparent pl-0">
                <Link to="/search" className="opacity-60">
                    Search
                </Link>
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
                            alt={`Image ${selectedColor.id} ${index + 1}`}
                            className="object-cover w-full max-h-96"
                        />
                    ))}
                </Carousel>
            </div>

            <div className="mb-2">
                <h2 className="text-lg font-semibold mb-2">Select Color:</h2>

                <ColorSelector colors={groupedItem.itemColors} selectedColor={selectedColor!} setSelectedColor={setColor}></ColorSelector>
            </div>

            <div className="mb-8">
                <h2 className="text-lg font-semibold mb-2">Select Size:</h2>
                <div className="flex space-x-4">
                    {sizeList.map((size) => (
                        <div
                            key={size}
                            onClick={() => setSize(size)}
                            className={classNames(
                                'border px-4 py-2 rounded-md transition-all duration-200', 
                                {
                                    'bg-blue-500 text-white': size === selectedItem?.size, 
                                    'bg-gray-300 text-gray-500 cursor-not-allowed': !availableSizes.includes(size), 
                                    'bg-gray-100 text-black hover:bg-blue-100': availableSizes.includes(size) && size !== selectedItem?.size, 
                                }
                            )}
                        >
                            {size}
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
