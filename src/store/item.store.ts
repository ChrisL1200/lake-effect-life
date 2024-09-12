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
    colors: Color[];
    type: ItemType;
    size?: ItemSize;
    imgUrls: string[];
}
export enum ItemFilterKey {
    Color = "Color",
    Type = "Type",
}

export interface ItemFilter {
    key: ItemFilterKey;
    selectedValues: string[];
    options: string[];
}

interface ItemsState {
    filters: ItemFilter[];
    itemMap: Record<string, Item>;
    paginatedItems: Record<number, string[]>;
}

const initialState: ItemsState = {
    filters: [
        {
            key: ItemFilterKey.Color,
            selectedValues: [],
            options: [Color.BLUE, Color.GREEN, Color.ORANGE, Color.PURPLE, Color.RED, Color.YELLOW]
        },
        {
            key: ItemFilterKey.Type,
            selectedValues: [],
            options: [ItemType.HOODIE, ItemType.JACKET, ItemType.LONGSLEEVE, ItemType.SWEATSHIRT, ItemType.TANKTOP, ItemType.TSHIRT]
        }
    ],
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
        updateFilters(state, action: PayloadAction<ItemFilter[]>) {
            state.filters = action.payload;
        }
    },
});

export const { addPageOfItems, updateFilters } = itemsSlice.actions;

export default itemsSlice.reducer;
