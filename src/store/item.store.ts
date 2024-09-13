import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Item, { ItemType } from '../models/item.model';
import ItemColor, { Color } from '../models/itemColor.model';

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
    filteredItems: Item[];
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
            state.filteredItems = items;
        },
        updateFilters(state, action: PayloadAction<ItemFilter[]>) {
            state.filters = action.payload;
            state.filteredItems = Object.values(state.itemMap).map((item: Item) => JSON.parse(JSON.stringify(item))).filter((item: Item) => {
                let unfilteredItem = true;
                item.colors = item.colors.filter((itemColor: ItemColor) => {
                    let unfilteredColor = true;
                    state.filters.forEach((filter: ItemFilter) => {
                        switch (filter.key) {
                            case ItemFilterKey.Color:
                                if (filter.selectedValues.length > 0 && !filter.selectedValues.includes(itemColor.color)) {
                                    unfilteredColor = false;
                                }
                                break;
                        }
                    });
                    return unfilteredColor;
                });

                state.filters.forEach((filter: ItemFilter) => {
                    switch (filter.key) {
                        case ItemFilterKey.Type:
                            if (filter.selectedValues.length > 0 && !filter.selectedValues.includes(item.type)) {
                                unfilteredItem = false;
                            }
                            break;
                    }
                });

                if (item.colors.length === 0) {
                    unfilteredItem = false;
                }

                return unfilteredItem;
            });
        }
    },
});

export const { addItems, updateFilters } = itemsSlice.actions;

export default itemsSlice.reducer;
