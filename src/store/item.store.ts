import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum Color {
    BLUE = "Blue",
    RED = "Red",
    ORANGE = "Orange",
    YELLOW = "Yellow",
    GREEN = "Green",
    PURPLE = "Purple"
}
export enum ItemType {
    TSHIRT = "T-Shirt",
    LONGSLEEVE = "Long Sleeve",
    HOODIE = "Hoodie",
    JACKET = "Jacket",
    SWEATSHIRT = "Sweatshirt",
    TANKTOP = "Tank Top"
}
export enum ItemSize {
    SMALL = "Small",
    MEDIUM = "Medium",
    LARGE = "Large",
    XLARGE = "XL",
    XXLARGE = "XXL"
}

export interface Item {
    id: string;
    name: string;
    color: Color;
    type: ItemType;
    size?: ItemSize;
}

interface ItemsState {
    itemMap: Record<string, Item>;
    paginatedItems: Record<number, string[]>;
}

const initialState: ItemsState = {
    itemMap: {},
    paginatedItems: {},
};

const itemsSlice = createSlice({
    name: 'items',
    initialState,
    reducers: {
        addPageOfItems: (state, action: PayloadAction<Record<number, Item[]>>) => {
            const payloadKeys = Object.keys(action.payload);
            if (payloadKeys.length === 1) {
                const page: number = parseInt(payloadKeys[0]);
                const items: Item[] = action.payload[page];
                items.forEach((item: Item) => {
                    state.itemMap[item.id] = item;
                });
                state.paginatedItems[page] = items.map((item: Item) => item.id);
            }
        },
        addItem: (state, action: PayloadAction<Item>) => {
            const item: Item = action.payload;
            state.itemMap[item.id] = item;
        }
    },
});

export const { addPageOfItems,  } = itemsSlice.actions;

export default itemsSlice.reducer;
