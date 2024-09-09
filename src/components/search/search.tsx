import React, { useEffect, useState } from 'react';
import { Item, addPageOfItems } from "../../store/item.store.ts";
import { RootState } from '../../store';
import { useSelector, useDispatch } from 'react-redux';
import {
	Card,
	CardHeader,
	CardBody,
	CardFooter,
	Typography,
	Button,
} from "@material-tailwind/react";
import api from "../../api";

interface SearchProps {
	items?: Item[];
}

interface State {
    currentPage: number;
}

const Search: React.FC<SearchProps> = () => {
    const dispatch = useDispatch();
    const [state] = useState<State>({
        currentPage: 1
    });

    const loadPage = async () => {
        const items: Item[] = await api.item.getItems();
        dispatch(addPageOfItems({ [state.currentPage]: items }));
    }

    useEffect(() => {
        loadPage();
    }, []);

    const items = useSelector((reduxState: RootState) => {
        return (reduxState.items.paginatedItems[state.currentPage] ?? []).map((itemId: string) => reduxState.items.itemMap[itemId]);
    });

    return (
        <div>
            {items.map(item => (
                <Card key={item.id} className="mt-6 w-96 bg-red-500">
                    <CardHeader color="blue-gray" className="relative h-56">
                        <img
                            src="https://images.unsplash.com/photo-1540553016722-983e48a2cd10?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&q=80"
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
