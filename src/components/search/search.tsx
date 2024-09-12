import React, { useEffect, useState } from 'react';
import { Item, addItems } from "../../store/item.store.ts";
import { RootState } from '../../store';
import { useSelector, useDispatch } from 'react-redux';
import {
    Drawer,
	Card,
	CardHeader,
	CardBody,
	CardFooter,
	Typography,
	Button,
} from "@material-tailwind/react";
import api from "../../api";
import SearchFilters from './searchFilters.tsx';

interface Props {
	items?: Item[];
}

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

    const items = useSelector((reduxState: RootState) => {
        return (reduxState.items.filteredItems ?? []).map((itemId: string) => reduxState.items.itemMap[itemId]);
    });

    return (
        <div>
            <Button onClick={toggleMobileDrawer}>Filter</Button>
            <Drawer open={state.mobileFilterOpen} onClose={toggleMobileDrawer} className="p-4">
                <SearchFilters></SearchFilters>
            </Drawer>
            {items.map(item => (
                <Card key={item.id} className="mt-6 w-96">
                    <CardHeader color="blue-gray" className="relative h-56">
                        <img
                            src={`/images/items/${item.imgUrls[0]}`}
                            alt="card-image"
                        />
                    </CardHeader>
                    <CardBody>
                        <Typography variant="h5" color="blue-gray" className="mb-2">
                            { item.name }
                        </Typography>
                        <Typography>
                            { item.color }
                        </Typography>
                    </CardBody>
                    <CardFooter className="pt-0">
                        <Button>{item.id}</Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
};

export default Search;
