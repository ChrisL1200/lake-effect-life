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
    price: number;
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
    filteredItems: string[];
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
    filteredItems: [],
};

const itemsSlice = createSlice({
    name: 'items',
    initialState,
    reducers: {
        addItems: (state, action: PayloadAction<Item[]>) => {
            const items: Item[] = action.payload;
            items.forEach((item: Item) => {
                state.itemMap[item.id] = item;
            });
            state.filteredItems = items.map((item: Item) => item.id);
        },
        updateFilters(state, action: PayloadAction<ItemFilter[]>) {
            state.filters = action.payload;
            state.filteredItems = Object.values(state.itemMap).filter((item: Item) => {
                let unfiltered = true;
                state.filters.forEach((filter: ItemFilter) => {
                    switch (filter.key) {
                        case ItemFilterKey.Color:
                            if (filter.selectedValues.length > 0 && !filter.selectedValues.some((selectedValue: string) => item.colors.includes(selectedValue as Color))) {
                                unfiltered = false;
                            }
                            break;
                        case ItemFilterKey.Type:
                            if (filter.selectedValues.length > 0 && !filter.selectedValues.includes(item.type)) {
                                unfiltered = false;
                            }
                            break;
                    }
                });
                return unfiltered;
            }).map((item: Item) => item.id);
        }
    },
});

export const { addItems, updateFilters } = itemsSlice.actions;

export default itemsSlice.reducer;
