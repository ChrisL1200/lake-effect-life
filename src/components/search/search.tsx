import React, { useEffect, useState } from 'react';
import { Item, addItems } from "../../store/item.store.ts";
import { RootState } from '../../store';
import { useSelector, useDispatch } from 'react-redux';
import {
    Drawer,
	Button,
} from "@material-tailwind/react";
import api from "../../api";
import SearchFilters from './searchFilters.tsx';
import SearchCard from './SearchCard.tsx';

interface Props {}

interface State {
    mobileFilterOpen: boolean;
}

const Search: React.FC<Props> = () => {
    const dispatch = useDispatch();
    const [state, setState] = useState<State>({
        mobileFilterOpen: false
    });

    const loadPage = async () => {
        const items: Item[] = await api.item.getItems();
        dispatch(addItems(items));
    }

    const toggleMobileDrawer = () => {
        setState({
            ...state,
            mobileFilterOpen: !state.mobileFilterOpen
        })
    }

    useEffect(() => {
        loadPage();
    }, []);

    const filteredItems = useSelector((reduxState: RootState) => {
        return (reduxState.items.filteredItems ?? []).map((itemId: string) => reduxState.items.itemMap[itemId]);
    });

    return (
        <div>
            <div className="flex justify-center p-4">
                <Button onClick={toggleMobileDrawer}>Filter & Sort</Button>
            </div>
            <Drawer open={state.mobileFilterOpen} onClose={toggleMobileDrawer} className="p-4">
                <SearchFilters></SearchFilters>
            </Drawer>
            {filteredItems.map(filteredItem => (
                <SearchCard key={filteredItem.id} item={filteredItem}></SearchCard>
            ))}
        </div>
    );
};

export default Search;
