import React, { useState } from 'react';
import { Input, List, ListItem } from '@material-tailwind/react';

interface SearchProps {
    options?: string[];
    onSelect: (value: string) => void;
}

const SearchBar: React.FC<SearchProps> = ({ options = [], onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.length > 0) {
            const filtered = options.filter(option =>
                option.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredOptions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSelect = (value: string) => {
        setSearchTerm(value);
        setShowSuggestions(false);
        onSelect(value);
    };

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
                <List className="absolute top-full mt-1 bg-white w-full shadow-lg rounded-lg">
                    {filteredOptions.map((option, index) => (
                        <ListItem
                            key={index}
                            onClick={() => handleSelect(option)}
                            className="cursor-pointer hover:bg-gray-200"
                        >
                            {option}
                        </ListItem>
                    ))}
                </List>
            )}
        </div>
    );
};

export default SearchBar;
