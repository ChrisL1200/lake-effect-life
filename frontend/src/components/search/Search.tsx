import React, { useState } from 'react';
import { RootState } from '../../store';
import { useSelector } from 'react-redux';
import {
    Drawer,
	Button,
} from "@material-tailwind/react";
import SearchFilters from './SearchFilters.tsx';
import SearchCard from './SearchCard.tsx';
import SearchBar from '../common/SearchBar.tsx';
import { ItemFilter } from '../../store/item.store.ts';

interface Props {}

interface State {
    mobileFilterOpen: boolean;
}

const Search: React.FC<Props> = () => {
    const [state, setState] = useState<State>({
        mobileFilterOpen: false
    });

    const toggleMobileDrawer = () => {
        setState({
            ...state,
            mobileFilterOpen: !state.mobileFilterOpen
        })
    }

    const filteredItems = useSelector((reduxState: RootState) => {
        return (reduxState.items.filteredItems ?? []);
    });

    const filters = useSelector((reduxState: RootState) => reduxState.items.filters);

    const filterAndSortText = () => {
        let text = "Filter";
        let filterCount = 0;
        filters.forEach((filter: ItemFilter) => {
            filterCount += filter.selectedValues.length;
        });

        if (filterCount > 0) {
            text = `${text} (${filterCount})`;
        }

        return text;
    };

    return (
        <div>
            <div className="mt-2 w-full p-2">
                <SearchBar></SearchBar>
            </div>
            <div className="p-2 mb-2">
                <Button className="w-full" onClick={toggleMobileDrawer}>{filterAndSortText()}</Button>
            </div>
            <Drawer open={state.mobileFilterOpen} onClose={toggleMobileDrawer} className="p-4 max-h-screen">
                <SearchFilters></SearchFilters>
            </Drawer>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredItems.map(filteredItem => (
                    <SearchCard key={filteredItem.id} groupedItem={filteredItem}></SearchCard>
                ))}
            </div>
        </div>
    );
};

export default Search;
