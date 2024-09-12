import React, { useState } from 'react';
import {
    Accordion,
    AccordionHeader,
    AccordionBody,
    Checkbox,
    List,
    ListItem,
    ListItemPrefix,
    Typography
} from "@material-tailwind/react";
import { ItemFilter, ItemFilterKey, updateFilters } from "../../store/item.store";
import { RootState } from '../../store';
import { useSelector, useDispatch } from 'react-redux';
interface Props { }

interface State {
    accordionExpandMap: Record<ItemFilterKey, boolean>;
}

function Icon({ open }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className={`${open ? "rotate-180" : ""} h-5 w-5 transition-transform`}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
    );
}

const SearchFilters: React.FC<Props> = () => {
    const dispatch = useDispatch();
    const [state, setState] = useState<State>({
        accordionExpandMap: {
            [ItemFilterKey.Color]: true,
            [ItemFilterKey.Type]: true
        }
    });

    const filters = useSelector((reduxState: RootState) => reduxState.items.filters);

    const handleOpen = (key: ItemFilterKey) => {
        const updatedAccordionExpandMap = { ...state.accordionExpandMap };
        updatedAccordionExpandMap[key] = !state.accordionExpandMap[key];
        setState({
            ...state,
            accordionExpandMap: updatedAccordionExpandMap
        });
    }

    const updateFilter = (filterKey: ItemFilterKey, selectedOption: string) => {
        const updatedFilters = structuredClone(filters);
        updatedFilters.forEach((updatedFilter: ItemFilter) => {
            if (updatedFilter.key === filterKey) {
                const selectedValueIndex: number = updatedFilter.selectedValues.indexOf(selectedOption);
                if (selectedValueIndex !== -1) {
                    updatedFilter.selectedValues.splice(selectedValueIndex, 1);
                } else {
                    updatedFilter.selectedValues.push(selectedOption);
                }
            }
        });
        dispatch(updateFilters(updatedFilters));
    }

    return (
        <>
            {filters.map(filter => (
                <Accordion key={filter.key} open={state.accordionExpandMap[filter.key]} icon={<Icon open={state.accordionExpandMap[filter.key]} />}>
                    <AccordionHeader onClick={() => handleOpen(filter.key)}>{filter.key}</AccordionHeader>
                    <AccordionBody>
                        <List>
                            {filter.options.map(option => (
                                <ListItem key={option} className="p-0">
                                    <label
                                        htmlFor="vertical-list-react"
                                        className="flex w-full cursor-pointer items-center px-3 py-2"
                                    >
                                        <ListItemPrefix className="mr-3">
                                            <Checkbox
                                                id="vertical-list-react"
                                                defaultChecked={filter.selectedValues.includes(option)}
                                                onChange={() => updateFilter(filter.key, option)}
                                                ripple={false}
                                                className="hover:before:opacity-0"
                                                containerProps={{
                                                    className: "p-0",
                                                }}
                                            />
                                        </ListItemPrefix>
                                        <Typography color="blue-gray" className="font-medium">
                                            {option }
                                        </Typography>
                                    </label>
                                </ListItem>
                            ))}
                        </List>
                    </AccordionBody>
                </Accordion>
            ))}
        </>
    );
}

export default SearchFilters;