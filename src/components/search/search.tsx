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

    return (
        <div>
            <div className="flex w-full p-3">
                <span className="pr-2">
                    <SearchBar></SearchBar>
                </span>
                <span>
                    <Button onClick={toggleMobileDrawer}>Filter & Sort</Button>
                </span>
            </div>
            <Drawer open={state.mobileFilterOpen} onClose={toggleMobileDrawer} className="p-4 max-h-screen">
                <SearchFilters></SearchFilters>
            </Drawer>
            <div className="grid grid-cols-2 gap-4">
                {filteredItems.map(filteredItem => (
                    <SearchCard key={filteredItem.id} groupedItem={filteredItem}></SearchCard>
                ))}
            </div>
        </div>
    );
};

export default Search;
