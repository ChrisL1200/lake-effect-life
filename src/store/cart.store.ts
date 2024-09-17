import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Item from '../models/item.model';

export interface CartItem {
    item: Item;
    quantity: number;
}

interface CartState {
    cart: CartItem[];
}

const initialState: CartState = {
    cart: [],
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        clearCart: (state) => {
            state.cart = [];
        },
        deleteItemFromCart: (state, action: PayloadAction<string>) => {
            state.cart = state.cart.filter((cartItem: CartItem) => cartItem.item.id === action.payload);
        },
        upsertItemFromCart(state, action: PayloadAction<CartItem>) {
            const upsertedCartItem = action.payload;
            const index = state.cart.findIndex((cartItem: CartItem) => cartItem.item.id === upsertedCartItem.item.id);

            if (index !== -1) {
                state.cart.splice(index, 1, upsertedCartItem);
            } else {
                state.cart.push(upsertedCartItem);
            }
        }
    },
});

export const { clearCart, deleteItemFromCart, upsertItemFromCart } = cartSlice.actions;

export default cartSlice.reducer;
