// src/store/itemsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Item {
    id: string;
    name: string;
}

interface ItemsState {
    items: Item[];
}

const initialState: ItemsState = {
    items: [],
};

const itemsSlice = createSlice({
    name: 'items',
    initialState,
    reducers: {
        addItem: (state, action: PayloadAction<Item>) => {
            state.items.push(action.payload);
        },
        removeItem: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter(item => item.id !== action.payload);
        },
    },
});

export const { addItem, removeItem } = itemsSlice.actions;

export default itemsSlice.reducer;
