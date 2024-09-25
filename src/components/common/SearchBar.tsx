import React, { useState } from 'react';
import { Input, List, ListItem } from '@material-tailwind/react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { ItemFilter, SearchOption, SearchOptionKey, updateFilters } from '../../store/item.store';
import { useLocation, useNavigate } from 'react-router-dom';

const SearchBar: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOptions, setFilteredOptions] = useState<SearchOption[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const filters = useSelector((reduxState: RootState) => reduxState.items.filters);

    const updateSearchTerm = (searchTerm: string) => {
        setSearchTerm(searchTerm);
        const filtered = options.filter(option =>
            option.value.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setFilteredOptions(filtered.slice(0, 5));
        setShowSuggestions(true);
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateSearchTerm(e.target.value);
    };

    const handleSelect = (searchOption: SearchOption) => {
        setShowSuggestions(false);
        if (location.pathname !== '/search') {
            navigate('/search');
        }

        const updateFilterPayload: { filters?: ItemFilter[], searchOption?: SearchOption } = {};
        if (searchOption.key !== SearchOptionKey.Text) {
            updateFilterPayload.filters = structuredClone(filters);
            updateFilterPayload.filters.forEach((updatedFilter: ItemFilter) => {
                if (updatedFilter.key === searchOption.key) {
                    updatedFilter.selectedValues = [searchOption.value];
                }
            });
            setSearchTerm("");
        } else {
            updateFilterPayload.searchOption = searchOption;
            setSearchTerm(searchOption.value);
        }

        dispatch(updateFilters(updateFilterPayload));
    };

    const onInputFocus = () => {
        if (filteredOptions.length === 0 && searchTerm === "") {
            updateSearchTerm(searchTerm);
        }
        setShowSuggestions(true);
    };

    const onInputBlur = () => {
        setTimeout(() => {
            setShowSuggestions(false);
        }, 0);
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
                onBlur={onInputBlur}
                onChange={handleInputChange}
                onFocus={onInputFocus}
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
