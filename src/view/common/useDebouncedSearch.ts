import { useState, useEffect, type Dispatch, type SetStateAction } from "react";

/**
 * Custom hook for debouncing a search term.
 * @param {string} initialValue - The initial value of the search term.
 * @param {number} delay - The debounce delay in milliseconds.
 * @returns {{searchTerm: string, setSearchTerm: Function, debouncedSearchTerm: string}}
 */
const useDebouncedSearch = (initialValue = "", delay = 1500): {
    searchTerm: string;
    setSearchTerm: Dispatch<SetStateAction<string>>;
    debouncedSearchTerm: string;
} => {
    const [searchTerm, setSearchTerm] = useState(initialValue);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(initialValue);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, delay);

        return () => clearTimeout(handler);
    }, [searchTerm, delay]);

    return { searchTerm, setSearchTerm, debouncedSearchTerm };
};

export default useDebouncedSearch;