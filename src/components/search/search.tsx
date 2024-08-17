import React from 'react';
import { Item } from "../../store/itemsSlice.ts";
import { RootState } from '../../store/store.ts';
import { useSelector } from 'react-redux';

interface SearchProps {
	items?: Item[];
}

const Search: React.FC<SearchProps> = () => {
	const items = useSelector((state: RootState) => state.items.items);
	console.log(items);
  return <h1>Search Page</h1>;
};

export default Search;
