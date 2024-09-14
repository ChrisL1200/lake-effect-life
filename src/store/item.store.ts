import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Item, { ItemType } from '../models/item.model';
import ItemColor, { Color } from '../models/itemColor.model';

export enum ItemFilterKey {
    Color = "Color",
    Type = "Type",
    Search = "Search"
}

export interface ItemFilter {
    key: ItemFilterKey;
    selectedValues: string[];
    options: string[];
}

export enum SearchOptionKey {
    Type = "Type",
    Name = "Name",
    Text = "Text"
}

export interface SearchOption {
    key: SearchOptionKey;
    value: string;
}

interface ItemsState {
    filters: ItemFilter[];
    itemMap: Record<string, Item>;
    filteredItems: Item[];
    searchOptions: SearchOption[];
    selectedSearchOption: SearchOption;
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
    searchOptions: [],
    selectedSearchOption: {
        key: SearchOptionKey.Text,
        value: ""
    }
};

const containsCaseInsensitive = (searchTerm: string, str: string): boolean => {
    return str.toLowerCase().includes(searchTerm.toLowerCase());
};

const itemsSlice = createSlice({
    name: 'items',
    initialState,
    reducers: {
        addItems: (state, action: PayloadAction<Item[]>) => {
            const items: Item[] = action.payload;
            state.searchOptions = [];
            const searchOptionsMap: Record<SearchOptionKey, string[]> = {
                [SearchOptionKey.Name]: [],
                [SearchOptionKey.Type]: []
            };

            items.forEach((item: Item) => {
                state.itemMap[item.id] = item;

                if (!searchOptionsMap[SearchOptionKey.Name].includes(item.name)) {
                    searchOptionsMap[SearchOptionKey.Name].push(item.name);
                }

                if (!searchOptionsMap[SearchOptionKey.Type].includes(item.type)) {
                    searchOptionsMap[SearchOptionKey.Type].push(item.type);
                }
            });

            Object.entries(searchOptionsMap).forEach(([key, values]) => {
                values.forEach((value: string) => {
                    state.searchOptions.push({ key: key as SearchOptionKey, value });
                })
            });

            state.filteredItems = items;
            console.log('addItems', state);
        },
        updateFilters(state, action: PayloadAction<{ filters?: ItemFilter[], searchOption?: SearchOption }>) {
            const { filters, searchOption } = action.payload;
            if (filters) {
                state.filters = filters;
            }

            state.filteredItems = Object.values(state.itemMap).map((item: Item) => JSON.parse(JSON.stringify(item))).filter((item: Item) => {
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

                if (item.colors.length === 0) {
                    return false;
                }

                let unfilteredItem = true;
                state.filters.forEach((filter: ItemFilter) => {
                    switch (filter.key) {
                        case ItemFilterKey.Type:
                            if (filter.selectedValues.length > 0 && !filter.selectedValues.includes(item.type)) {
                                unfilteredItem = false;
                            }
                            break;
                    }
                });

                if (searchOption) {
                    state.selectedSearchOption = searchOption;
                    switch (searchOption.key) {
                        case SearchOptionKey.Text:
                            if (!containsCaseInsensitive(searchOption.value, item.name) && !containsCaseInsensitive(searchOption.value, item.type)) {
                                unfilteredItem = false;
                            }
                            break;

                        case SearchOptionKey.Name:
                            if (searchOption.value !== item.name) {
                                unfilteredItem = false
                            }
                            break;

                        case SearchOptionKey.Type:
                            if (searchOption.value !== item.type) {
                                unfilteredItem = false
                            }
                            break;
                    }
                }

                return unfilteredItem;
            });
        }
    },
});

export const { addItems, updateFilters } = itemsSlice.actions;

export default itemsSlice.reducer;
