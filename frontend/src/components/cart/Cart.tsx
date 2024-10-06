import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { useNavigate } from 'react-router-dom';
import { deleteItemFromCart, upsertItemFromCart } from '../../store/cart.store';
import CartItem from '../../models/cartItem.model';
import Item from '../../models/item.model';
import GroupedItem from '../../models/groupedItem.model';
import ItemColor from '../../models/itemColor.model';

interface PopulatedCartItem {
    quantity: number;
    item: Item;
    itemColor: ItemColor;
    groupedItem: GroupedItem;
}

const Cart: React.FC = () => {
    const populatedCartItems: PopulatedCartItem[] = useSelector((reduxState: RootState) => {
        return reduxState.cart.cartItems.map((cartItem: CartItem) => {
            const item = reduxState.items.itemMap[cartItem.itemId];
            const groupedItem = reduxState.items.groupedItemMap[cartItem.groupedItemId];
            const itemColor = groupedItem.itemColors.find((itemColor: ItemColor) => itemColor.id === cartItem.itemColorId)!;

            return {
                item,
                groupedItem,
                itemColor,
                quantity: cartItem.quantity
            }
        });
    });

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const shippingCost = 5.0;  // Flat shipping fee
    const taxRate = 0.07;  // 7% tax

    // Calculate total price
    const totalPrice = populatedCartItems.reduce((acc: number, populatedCartItem: PopulatedCartItem) => acc + populatedCartItem.item.price * populatedCartItem.quantity, 0);
    const taxAmount = totalPrice * taxRate;
    const finalTotal = totalPrice + taxAmount + shippingCost;

    // Handle checkout button click
    const handleCheckout = () => {
        navigate('/checkout');
    };

    // Handle quantity update
    const handleQuantityChange = (populatedCartItem: PopulatedCartItem, quantity: number) => {
        if (quantity > 0) {
            dispatch(upsertItemFromCart({
                itemId: populatedCartItem.item.id,
                groupedItemId: populatedCartItem.groupedItem.id,
                itemColorId: populatedCartItem.itemColor.id,
                quantity
            }));
        } else {
            dispatch(deleteItemFromCart(populatedCartItem.item.id));
        }
    };

    const handleRemoveItem = (itemId: string) => {
        dispatch(deleteItemFromCart(itemId));
    };

    return (
        <div className="p-6 mx-auto max-w-lg">
            <h1 className="text-2xl font-bold mb-4">Cart</h1>

            {populatedCartItems.length === 0 ? (
                <p className="text-gray-500">Your cart is empty</p>
            ) : (
                <div>
                    <ul className="mb-6">
                            {populatedCartItems.map(populatedCartItem => (
                                <li key={populatedCartItem.item.id} className="flex justify-between items-center mb-4">
                                    <div>
                                        <p className="font-medium">{populatedCartItem.groupedItem.id}</p>
                                        <p className="font-medium">{populatedCartItem.itemColor.color} {populatedCartItem.item.size}</p>
                                        <p className="text-gray-500">
                                                {populatedCartItem.quantity} x ${populatedCartItem.item.price.toFixed(2)}
                                        </p>
                                    </div>
                                <div className="flex items-center">
                                    <button
                                        className="px-2"
                                            onClick={() => handleQuantityChange(populatedCartItem, populatedCartItem.quantity - 1)}
                                    >
                                        -
                                    </button>
                                        <span className="px-4">{populatedCartItem.quantity}</span>
                                    <button
                                        className="px-2"
                                            onClick={() => handleQuantityChange(populatedCartItem, populatedCartItem.quantity + 1)}
                                    >
                                        +
                                    </button>
                                    <button
                                            onClick={() => handleRemoveItem(populatedCartItem.item.id)}
                                        className="text-red-500 ml-4"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div className="border-t pt-4 mb-4">
                        <div className="flex justify-between mb-2">
                            <p className="text-xl">Subtotal:</p>
                            <p>${totalPrice.toFixed(2)}</p>
                        </div>
                        <div className="flex justify-between mb-2">
                            <p className="text-xl">Shipping:</p>
                            <p>${shippingCost.toFixed(2)}</p>
                        </div>
                        <div className="flex justify-between mb-2">
                            <p className="text-xl">Tax:</p>
                            <p>${taxAmount.toFixed(2)}</p>
                        </div>
                        <div className="flex justify-between items-center border-t pt-4">
                            <p className="text-xl font-semibold">Total:</p>
                            <p className="text-xl font-semibold">${finalTotal.toFixed(2)}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleCheckout}
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
                    >
                        Checkout
                    </button>
                </div>
            )}
        </div>
    );
};

export default Cart;
