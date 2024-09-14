import React, { useState } from 'react';
import { Input, List, ListItem } from '@material-tailwind/react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { SearchOption, SearchOptionKey, updateFilters } from '../../store/item.store';

interface SearchProps {}

const SearchBar: React.FC<SearchProps> = () => {
    const dispatch = useDispatch();
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOptions, setFilteredOptions] = useState<SearchOption[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value.length > 0) {
            const filtered = options.filter(option =>
                option.value.toLowerCase().includes(value.toLowerCase())
            );

            setFilteredOptions(filtered.slice(0, 5));
            setShowSuggestions(true);
        } else {
            dispatch(updateFilters({ searchOption: { key: SearchOptionKey.Text, value: "" } }));
            setShowSuggestions(false);
        }
    };

    const handleSelect = (searchOption: SearchOption) => {
        setSearchTerm(searchOption.value);
        setShowSuggestions(false);
        dispatch(updateFilters({ searchOption }));
    };

    const options = useSelector((reduxState: RootState) => {
        return (reduxState.items.searchOptions);
    });

    return (
        <div className="relative">
            <Input
                type="text"
                label="Search"
                value={searchTerm}
                onChange={handleInputChange}
                className="w-full"
            />
            {showSuggestions && filteredOptions.length > 0 && (
                <List className="absolute top-full left-0 mt-1 bg-white w-full shadow-lg rounded-lg z-10">
                    {filteredOptions.map((option) => (
                        <ListItem
                            key={option.value}
                            onClick={() => handleSelect(option)}
                            className="cursor-pointer hover:bg-gray-200"
                        >
                            {option.value}
                        </ListItem>
                    ))}
                </List>
            )}
        </div>
    );
};

export default SearchBar;
