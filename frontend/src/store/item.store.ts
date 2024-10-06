import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import ItemColor, { Color } from '../models/itemColor.model';
import GroupedItem, { ItemGender, ItemType } from '../models/groupedItem.model';
import Item, { ItemSize } from '../models/item.model';

export enum ItemFilterKey {
    Color = "Color",
    Type = "Type",
    Search = "Search",
    Size = "Size",
    Gender = "Gender",
    Price = "Price"
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
    groupedItemMap: Record<string, GroupedItem>;
    filteredItems: GroupedItem[];
    searchOptions: SearchOption[];
    selectedSearchOption: SearchOption;
    itemMap: Record<string, Item>;
    itemColorMap: Record<string, ItemColor>;
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
        },
        {
            key: ItemFilterKey.Gender,
            selectedValues: [],
            options: [ItemGender.WOMEN, ItemGender.MEN, ItemGender.KIDS]
        },
        {
            key: ItemFilterKey.Size,
            selectedValues: [],
            options: [
                ItemSize.SMALL,
                ItemSize.MEDIUM,
                ItemSize.LARGE,
                ItemSize.XLARGE,
                ItemSize.XXLARGE
            ]
        }
    ],
    groupedItemMap: {},
    filteredItems: [],
    searchOptions: [],
    selectedSearchOption: {
        key: SearchOptionKey.Text,
        value: ""
    },
    itemColorMap: {},
    itemMap: {}
};

const containsCaseInsensitive = (searchTerm: string, str: string): boolean => {
    return str.toLowerCase().includes(searchTerm.toLowerCase());
};

const itemsSlice = createSlice({
    name: 'items',
    initialState,
    reducers: {
        addGroupedItems: (state, action: PayloadAction<GroupedItem[]>) => {
            const groupedItems: GroupedItem[] = action.payload;
            state.searchOptions = [];
            const searchOptionsMap: Record<SearchOptionKey, string[]> = {
                [SearchOptionKey.Name]: [],
                [SearchOptionKey.Type]: []
            };

            console.log(groupedItems);

            groupedItems.forEach((groupedItem: GroupedItem) => {
                state.groupedItemMap[groupedItem.id] = groupedItem;

                if (!searchOptionsMap[SearchOptionKey.Name].includes(groupedItem.id)) {
                    searchOptionsMap[SearchOptionKey.Name].push(groupedItem.id);
                }

                if (!searchOptionsMap[SearchOptionKey.Type].includes(groupedItem.type)) {
                    searchOptionsMap[SearchOptionKey.Type].push(groupedItem.type);
                }

                groupedItem.colors.forEach((itemColor: ItemColor) => {
                    state.itemColorMap[itemColor.id] = itemColor;
                    itemColor.items.forEach((item: Item) => {
                        state.itemMap[item.id] = item;
                    })
                });
            });

            Object.entries(searchOptionsMap).forEach(([key, values]) => {
                values.forEach((value: string) => {
                    state.searchOptions.push({ key: key as SearchOptionKey, value });
                })
            });

            const sortOrder: SearchOptionKey[] = [SearchOptionKey.Type, SearchOptionKey.Name];
            state.searchOptions.sort((a: SearchOption, b: SearchOption) => {
                return sortOrder[a.key] > sortOrder[b.key] ? 1 : -1;
            });

            state.filteredItems = groupedItems;
        },
        updateFilters(state, action: PayloadAction<{ filters?: ItemFilter[], searchOption?: SearchOption }>) {
            const { filters, searchOption } = action.payload;
            if (filters) {
                state.filters = filters;
            }

            state.filteredItems = Object.values(state.groupedItemMap).map((item: GroupedItem) => JSON.parse(JSON.stringify(item))).filter((groupedItem: GroupedItem) => {
                groupedItem.colors = groupedItem.colors.filter((itemColor: ItemColor) => {
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

                    itemColor.items = itemColor.items.filter((item: Item) => {
                        let unfilteredItem = true;
                        state.filters.forEach((filter: ItemFilter) => {
                            switch (filter.key) {
                                case ItemFilterKey.Size:
                                    if (filter.selectedValues.length > 0 && !filter.selectedValues.includes(item.size)) {
                                        unfilteredItem = false;
                                    }
                                    break;
                            }
                        });

                        return unfilteredItem;
                    });
                    return unfilteredColor;
                });

                if (groupedItem.colors.length === 0) {
                    return false;
                }

                let unfilteredItem = true;
                state.filters.forEach((filter: ItemFilter) => {
                    switch (filter.key) {
                        case ItemFilterKey.Type:
                            if (filter.selectedValues.length > 0 && !filter.selectedValues.includes(groupedItem.type)) {
                                unfilteredItem = false;
                            }
                            break;
                        case ItemFilterKey.Gender:
                            if (filter.selectedValues.length > 0 && !filter.selectedValues.includes(groupedItem.gender)) {
                                unfilteredItem = false;
                            }
                            break;
                    }
                });

                if (searchOption) {
                    state.selectedSearchOption = searchOption;
                    switch (searchOption.key) {
                        case SearchOptionKey.Text:
                            if (!containsCaseInsensitive(searchOption.value, groupedItem.id) && !containsCaseInsensitive(searchOption.value, groupedItem.type)) {
                                unfilteredItem = false;
                            }
                            break;

                        case SearchOptionKey.Name:
                            if (searchOption.value !== groupedItem.id) {
                                unfilteredItem = false
                            }
                            break;

                        case SearchOptionKey.Type:
                            if (searchOption.value !== groupedItem.type) {
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

export const { addGroupedItems, updateFilters } = itemsSlice.actions;

export default itemsSlice.reducer;
