import { useState, useEffect } from "react";

/**
 * Custom hook for debouncing a search term.
 * @param {string} initialValue - The initial value of the search term.
 * @param {number} delay - The debounce delay in milliseconds.
 * @returns {{searchTerm: string, setSearchTerm: Function, debouncedSearchTerm: string}}
 */
const useDebouncedSearch = (initialValue = "", delay = 1500) => {
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