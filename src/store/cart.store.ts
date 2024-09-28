import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import CartItem from '../models/cartItem.model';

interface CartState {
    cartItems: CartItem[];
}

const initialState: CartState = {
    cartItems: [],
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        clearCart: (state) => {
            state.cartItems = [];
        },
        deleteItemFromCart: (state, action: PayloadAction<string>) => {
            state.cartItems = state.cartItems.filter((cartItem: CartItem) => cartItem.itemId !== action.payload);
        },
        upsertItemFromCart(state, action: PayloadAction<CartItem>) {
            const upsertedCartItem = action.payload;
            const index = state.cartItems.findIndex((cartItem: CartItem) => cartItem.itemId === upsertedCartItem.itemId);

            if (index !== -1) {
                state.cartItems.splice(index, 1, upsertedCartItem);
            } else {
                state.cartItems.push(upsertedCartItem);
            }
        }
    },
});

export const { clearCart, deleteItemFromCart, upsertItemFromCart } = cartSlice.actions;

export default cartSlice.reducer;
